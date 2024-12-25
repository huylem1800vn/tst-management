const mongoose = require("mongoose");

const degreeSchema = new mongoose.Schema({
  degreeCode: { type: String, required: true },
  fullName: { type: String, required: true },
  unit: String,
  program: String,
  issueDate: Date
}, 
{
  timestamps: true,
}
);

const Degree = mongoose.model('Degree', degreeSchema);


module.exports = Degree;
  