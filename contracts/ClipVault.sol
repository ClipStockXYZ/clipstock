// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ClipVault
/// @notice Pons V2 creator-fee recipient for ClipStock ($CLIP) on Robinhood Chain (4663).
///         Holder sharing OFF. Pair ETH. Creator tax 5% → this vault.
///         harvest() pulls ETH from Pons FeeEscrow.
///         clip() wraps ETH and buys NVDA on Uniswap V3.
///         Holders claim NVDA each 15-minute epoch (keeper merkle).
/// @custom:site https://clipstock.xyz
/// @custom:github https://github.com/ClipStockXYZ/clipstock

interface IFeeEscrow {
    function claim() external;
}

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
}

interface IWETH is IERC20 {
    function deposit() external payable;
}

interface ISwapRouter02 {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

contract ClipVault {
    uint64 public constant EPOCH = 15 minutes;

    address public constant ESCROW = 0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e;
    address public constant WETH = 0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73;
    address public constant NVDA = 0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC;

    string public constant SITE = "https://clipstock.xyz";
    string public constant GITHUB = "https://github.com/ClipStockXYZ/clipstock";
    string public constant TELEGRAM = "https://t.me/ClipStock";
    string public constant LINE = "Trade ETH. The desk clips NVDA. Holders take the shares.";

    address public owner;
    address public keeper;
    address public clipToken;
    address public router;
    uint24 public poolFee;
    uint256 public minClip;

    uint64 public epoch;
    uint64 public epochEndsAt;
    uint256 public unassigned;

    uint256 private locked;

    struct Clip {
        bytes32 root;
        uint256 pot;
        uint256 totalWeight;
        bool settled;
    }

    mapping(uint64 => Clip) public clips;
    mapping(uint64 => mapping(address => bool)) public claimed;

    error Auth();
    error Early();
    error Bad();
    error Proof();
    error Reentrancy();

    event Ownership(address indexed who);
    event KeeperSet(address indexed who);
    event TokenSet(address indexed token);
    event RouterSet(address indexed who, uint24 fee, uint256 minClip);
    event Harvested(uint256 value);
    event Clipped(uint256 ethIn, uint256 nvdaOut);
    event EpochSettled(uint64 indexed e, bytes32 root, uint256 pot, uint256 totalWeight);
    event Claimed(uint64 indexed e, address indexed who, uint256 amount);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Auth();
        _;
    }

    modifier onlyKeeper() {
        if (msg.sender != keeper) revert Auth();
        _;
    }

    modifier lock() {
        if (locked != 0) revert Reentrancy();
        locked = 1;
        _;
        locked = 0;
    }

    constructor(address keeper_) {
        if (keeper_ == address(0)) revert Bad();
        owner = msg.sender;
        keeper = keeper_;
        router = 0xcaf681a66d020601342297493863e78c959e5cb2;
        poolFee = 3000;
        minClip = 0.02 ether;
        epochEndsAt = uint64(block.timestamp) + EPOCH;
        emit Ownership(msg.sender);
        emit KeeperSet(keeper_);
    }

    receive() external payable {}

    function harvest() external lock {
        uint256 before = address(this).balance;
        IFeeEscrow(ESCROW).claim();
        emit Harvested(address(this).balance - before);
    }

    function clip(uint256 minOut) external onlyKeeper lock {
        uint256 amount = address(this).balance;
        if (amount < minClip) revert Early();
        IWETH(WETH).deposit{value: amount}();
        if (!IERC20(WETH).approve(router, amount)) revert Bad();
        uint256 out = ISwapRouter02(router).exactInputSingle(
            ISwapRouter02.ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: NVDA,
                fee: poolFee,
                recipient: address(this),
                amountIn: amount,
                amountOutMinimum: minOut,
                sqrtPriceLimitX96: 0
            })
        );
        unassigned += out;
        emit Clipped(amount, out);
    }

    function settleEpoch(bytes32 root, uint256 totalWeight) external onlyKeeper lock {
        if (block.timestamp < epochEndsAt) revert Early();
        uint64 e = epoch;
        if (clips[e].settled) revert Bad();
        uint256 pot = unassigned;
        unassigned = 0;
        clips[e] = Clip(root, pot, totalWeight, true);
        emit EpochSettled(e, root, pot, totalWeight);
        epoch = e + 1;
        if (block.timestamp < epochEndsAt + EPOCH) {
            epochEndsAt = epochEndsAt + EPOCH;
        } else {
            epochEndsAt = uint64(block.timestamp) + EPOCH;
        }
    }

    function claim(uint64 e, uint256 weight, bytes32[] calldata proof) external lock {
        Clip storage info = clips[e];
        if (!info.settled) revert Early();
        if (claimed[e][msg.sender]) revert Bad();
        if (info.totalWeight == 0) revert Bad();
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, e, weight))));
        if (!_verify(proof, info.root, leaf)) revert Proof();
        claimed[e][msg.sender] = true;
        uint256 amount = (info.pot * weight) / info.totalWeight;
        if (amount == 0) {
            emit Claimed(e, msg.sender, 0);
            return;
        }
        _safeTransfer(NVDA, msg.sender, amount);
        emit Claimed(e, msg.sender, amount);
    }

    function setKeeper(address who) external onlyOwner {
        if (who == address(0)) revert Bad();
        keeper = who;
        emit KeeperSet(who);
    }

    function setClipToken(address token) external onlyOwner {
        if (token == address(0)) revert Bad();
        clipToken = token;
        emit TokenSet(token);
    }

    function setRouter(address who, uint24 fee, uint256 minEth) external onlyOwner {
        if (who == address(0) || fee == 0) revert Bad();
        router = who;
        poolFee = fee;
        minClip = minEth;
        emit RouterSet(who, fee, minEth);
    }

    function transferOwnership(address who) external onlyOwner {
        if (who == address(0)) revert Bad();
        owner = who;
        emit Ownership(who);
    }

    function rescue(address token, address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert Bad();
        if (token == address(0)) {
            (bool ok, ) = to.call{value: amount}("");
            if (!ok) revert Bad();
        } else {
            _safeTransfer(token, to, amount);
        }
    }

    function _verify(bytes32[] calldata proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        bytes32 h = leaf;
        for (uint256 i; i < proof.length; i++) {
            bytes32 p = proof[i];
            h = h < p ? keccak256(abi.encodePacked(h, p)) : keccak256(abi.encodePacked(p, h));
        }
        return h == root;
    }

    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) revert Bad();
    }
}
