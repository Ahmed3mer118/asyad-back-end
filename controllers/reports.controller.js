const Purchase = require("../models/order.model")

exports.getSalesReports = async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const matchStage = {}
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate)
    }

    const report = await Purchase.aggregate([
        { $match: matchStage },// = find  
        {
            $lookup: // = if join
            {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: 'user'//
            }
        },
        { $unwind: '$user' }, // don't repate element
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $addFields: {
                totalPrice: { $multiply: ['$price', '$quantity'] }
            }
        }, {
            $facet: {
                overAllStatus: [
                    {
                        $group: {
                            _id: null, // romove id becouse select all 
                            totalSaleAmout: { $sum: `$totalPrice` },
                            totalQuantitySold: { $sum: `$quantity` },
                            numberOfPurchases: { $sum: 1 }
                        }
                    }],

                topProducts: [
                    {
                        $group: {
                            _id: '$product._id',
                            name: { $first: '$product.name' },
                            revenue: { $sum: '$totalPrice' },
                            soldQuantity: { $sum: '$quantity' },
                        }
                    },
                    { $sort: { revenue: - 1 } },
                    { $limit: 5 }
                ],


                topClients: [{
                    $group: {
                        _id: `$user._id`,
                        name: { $first: `$user.name` },
                        email: { $first: "$user.email" },
                        totalSpent: { $sum: '$totalPrice' },
                        totalQuantity: { $sum: '$quantity' }
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $limit: 5 }
                ],


                monthSales: [
                    {
                        $group: {
                            _id: {
                                year: { $year: `$createAt` },
                                month: { $month: `$createAt` },
                            },
                            totalRevenue: { $sum: '$totalPrice' },
                            totalQuantity: { $sum: '$quantity' },
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]


            }
        }
    ])

    res.status(200).json({ message: "Create Report", report })
}
