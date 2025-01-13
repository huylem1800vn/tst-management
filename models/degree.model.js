const mongoose = require("mongoose");

const degreeSchema = new mongoose.Schema({
  degreeCode: { type: String, required: true },
  fullName: { type: String, required: true },
  unit: { type: String, required: true },
  program: { type: String, required: true },
  issueDate: { type: Date },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: String,
  createdBy: String,
  updatedBy: String,
}, 
{
  timestamps: true,
}
);

const Degree = mongoose.model('Degree', degreeSchema);


module.exports = Degree;
  