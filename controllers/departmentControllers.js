const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const Department = require('../models/department')

exports.addDepartment = catchAsyncErrors(async (req,res) => {
    const newDepart = await Department.create(req.body)
    res.status(201).json({
        status:'success',
        newDepart
    })
})

exports.deleteDepartment = catchAsyncErrors(async (req,res) => {
    const del = await Department.findByIdAndDelete(req.params.id)
    res.status(200).json({
        status:'success',
        del
    })
})

exports.getDepartment = catchAsyncErrors(async (req,res) => {
    const findDept = await Department.find()
    res.status(200).json({
        status:'success',
        findDept
    })
})

exports.editDepartment = catchAsyncErrors(async (req,res) => {
    const updated = await Department.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        status:'success',
        updated
    })

})