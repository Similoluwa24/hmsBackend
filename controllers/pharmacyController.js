const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Pharmacy = require('../models/pharmacy');


exports.createPharmacyRecord = async (req, res) => {
    try {
        let { patients, doctor, drugs, linkedAppointment, linkedDiagnosis, notes } = req.body;

        // Convert empty strings to null
        linkedAppointment = linkedAppointment.trim() === "" ? null : linkedAppointment;
        linkedDiagnosis = linkedDiagnosis.trim() === "" ? null : linkedDiagnosis;

        const newRecord = await Pharmacy.create({
            patients,
            doctor,
            drugs,
            linkedAppointment,
            linkedDiagnosis,
            notes
        });

        res.status(201).json({
            success: true,
            message: 'Pharmacy record created successfully',
            data: newRecord
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating pharmacy record',
            error: error.message
        });
    }
};


exports.getMedication = catchAsyncErrors(async (req, res, next) => {
    const medications = await Pharmacy.find()
        .populate('patients') // Populate only patient name
        .populate('doctor'); // Populate only doctor name

    res.status(200).json({
        success: true,
        data: medications
    });
});


exports.getPharmacyById = catchAsyncErrors(async (req, res, next) => {
    const pharmacy = await Pharmacy.findById(req.params.id)
        .populate('patients', 'first_name last_name')  // Populate first and last name
        .populate('doctor', 'first_name last_name');  // Populate first and last name

    if (!pharmacy) {
        return res.status(404).json({
            success: false,
            message: "Pharmacy record not found"
        });
    }

    res.status(200).json({
        success: true,
        data: pharmacy
    });
});



exports.updatePharmacyRecord = catchAsyncErrors(async (req, res, next) => {
    let { linkedAppointment, linkedDiagnosis } = req.body;

    // Convert empty strings to null
    linkedAppointment = linkedAppointment?.trim() === "" ? null : linkedAppointment;
    linkedDiagnosis = linkedDiagnosis?.trim() === "" ? null : linkedDiagnosis;

    const updatedRecord = await Pharmacy.findByIdAndUpdate(
        req.params.id,
        { ...req.body, linkedAppointment, linkedDiagnosis },
        { new: true, runValidators: true }
    );

    if (!updatedRecord) {
        return res.status(404).json({
            success: false,
            message: "Pharmacy record not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Pharmacy record updated successfully",
        data: updatedRecord
    });
});


exports.deletePharmacyRecord = catchAsyncErrors(async (req, res, next) => {
    const deletedRecord = await Pharmacy.findByIdAndDelete(req.params.id);

    if (!deletedRecord) {
        return res.status(404).json({
            success: false,
            message: "Pharmacy record not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Pharmacy record deleted successfully"
    });
});
