
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PharmaSupplychain {

    // 1. Các trạng thái của lô thuốc
    enum Status {
        AtManufacturer,
        AtDistributor,
        AtPharmacy
    }

    // 2. Thông tin của một lô thuốc
    struct Product {
        uint256 productId;
        string medicineName;
        string batchId;
        uint256 manufactureDate;
        uint256 expiryDate;
        address manufacturer;
        address distributor;
        address pharmacy;
        Status status;
        bool exists;
    }

    // 3. Một sự kiện trong lịch sử chuyển giao
    struct HistoryRecord {
        string action;
        address actor;
        uint256 timestamp;
    }

    // 4. Ví Manufacturer và bộ đếm Product ID
    address public manufacturer;
    uint256 public productCount;

    // 5. Lưu thông tin và lịch sử thuốc
    mapping(uint256 => Product) private products;

    mapping(uint256 => HistoryRecord[])
        private productHistories;

    // 6. Kiểm tra Batch ID đã tồn tại
    mapping(bytes32 => bool) private usedBatchIds;

    // 7. Danh sách Product ID
    uint256[] private productIds;

    // 8. Blockchain Events
    event ProductCreated(
        uint256 indexed productId,
        string batchId,
        address indexed manufacturer
    );

    event CustodyTransferred(
        uint256 indexed productId,
        address indexed receiver,
        Status newStatus,
        uint256 timestamp
    );

    // 9. Người triển khai là Manufacturer
    constructor() {
        manufacturer = msg.sender;
    }

    // 10. Chỉ Manufacturer được thực hiện
    modifier onlyManufacturer() {
        require(
            msg.sender == manufacturer,
            "Only manufacturer is allowed"
        );
        _;
    }

    // 11. Kiểm tra lô thuốc tồn tại
    modifier productExists(uint256 _productId) {
        require(
            products[_productId].exists,
            "Product does not exist"
        );
        _;
    }

    // ===== CREATE PRODUCT =====

    function createProduct(
        string memory _medicineName,
        string memory _batchId,
        uint256 _manufactureDate,
        uint256 _expiryDate,
        address _distributor,
        address _pharmacy
    )
        public
        onlyManufacturer
        returns (uint256)
    {
        require(
            bytes(_medicineName).length > 0,
            "Medicine name is required"
        );

        require(
            bytes(_batchId).length > 0,
            "Batch ID is required"
        );

        require(
            _manufactureDate < _expiryDate,
            "Invalid expiry date"
        );

        require(
            _distributor != address(0) &&
            _pharmacy != address(0),
            "Invalid wallet address"
        );

        require(
            _distributor != _pharmacy &&
            _distributor != manufacturer &&
            _pharmacy != manufacturer,
            "Wallet roles must be different"
        );

        bytes32 batchHash = keccak256(
            bytes(_batchId)
        );

        require(
            !usedBatchIds[batchHash],
            "Batch ID already exists"
        );

        // Sinh ID tăng dần
        productCount++;
        uint256 newProductId = productCount;

        products[newProductId] = Product({
            productId: newProductId,
            medicineName: _medicineName,
            batchId: _batchId,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            manufacturer: msg.sender,
            distributor: _distributor,
            pharmacy: _pharmacy,
            status: Status.AtManufacturer,
            exists: true
        });

        usedBatchIds[batchHash] = true;
        productIds.push(newProductId);

        // Ghi lịch sử khởi tạo
        productHistories[newProductId].push(
            HistoryRecord({
                action: "Manufacturer created product",
                actor: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit ProductCreated(
            newProductId,
            _batchId,
            msg.sender
        );

        return newProductId;
    }

    // ===== DISTRIBUTOR CONFIRM =====

    function confirmDistributor(
        uint256 _productId
    )
        public
        productExists(_productId)
    {
        Product storage product = products[_productId];

        require(
            msg.sender == product.distributor,
            "Only assigned distributor is allowed"
        );

        require(
            product.status == Status.AtManufacturer,
            "Invalid product status"
        );

        product.status = Status.AtDistributor;

        productHistories[_productId].push(
            HistoryRecord({
                action: "Distributor confirmed receipt",
                actor: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit CustodyTransferred(
            _productId,
            msg.sender,
            Status.AtDistributor,
            block.timestamp
        );
    }

    // ===== PHARMACY CONFIRM =====

    function confirmPharmacy(
        uint256 _productId
    )
        public
        productExists(_productId)
    {
        Product storage product = products[_productId];

        require(
            msg.sender == product.pharmacy,
            "Only assigned pharmacy is allowed"
        );

        require(
            product.status == Status.AtDistributor,
            "Invalid product status"
        );

        product.status = Status.AtPharmacy;

        productHistories[_productId].push(
            HistoryRecord({
                action: "Pharmacy confirmed receipt",
                actor: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit CustodyTransferred(
            _productId,
            msg.sender,
            Status.AtPharmacy,
            block.timestamp
        );
    }

    // ===== VIEW FUNCTIONS =====

    function getProduct(
        uint256 _productId
    )
        public
        view
        productExists(_productId)
        returns (Product memory)
    {
        return products[_productId];
    }

    function getProductHistory(
        uint256 _productId
    )
        public
        view
        productExists(_productId)
        returns (HistoryRecord[] memory)
    {
        return productHistories[_productId];
    }

    function getAllProductIds()
        public
        view
        returns (uint256[] memory)
    {
        return productIds;
    }
}
