const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Order = require('../models/order')
const Product = require('../models/product')
const checkAuth = require('../middleware/checkAuth')

router.get('/', checkAuth, (req, res, next) => {
    Order.find().select('product quantity _id')
    .populate('product')
    .exec()
    .then(docs => {
        res.status(200).json(docs)
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.post('/', checkAuth, (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
            })
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        })
        return order.save();
    })
    .then(result => {
        res.status(201).json({
            message: 'Order was created',
            order: result
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })

})

router.get('/:orderId', (req, res, next) => {
    let id = req.params.orderId;
    Order.findById(id)
    .populate('product')
    .exec()
    .then(order => {
        if(!order) {
            return res.status(404).json({
                message: 'Product not found',
            })
        }
        res.status(200).json({
            order: order
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.delete('/:orderId', checkAuth, (req, res, next) => {
    let id = req.params.orderId;
    Order.remove({ _id: id }).exec()
        .then(result => {
            res.status(200).json({
                message: 'Order deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders/'
                }
            })
        })
        .catch(err => {
            res.status(500).json({ error: err })
        })
})


module.exports = router