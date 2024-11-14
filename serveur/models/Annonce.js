const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const annonceSchema = new Schema({
    title: { type: String, required: true },
    propertyType: { type: String, enum: ['À la vente', 'À la location'], required: true },
    publicationStatus: { type: String, enum: ['Publiée', 'Non publiée'], required: true },
    propertyStatus: { type: String, enum: ['Disponible', 'Loué', 'Vendu'], required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    availabilityDate: { type: Date, required: true },
    photos: { type: [String] },
    userName: { type: String, required: true },
    questions: [
        {
            user: { type: String, required: true },
            question: { type: String, required: true },
            answers: [{ user: String, answer: String }],
            date: { type: Date, default: Date.now },
        },
    ],
});

module.exports = mongoose.model('Annonce', annonceSchema);
