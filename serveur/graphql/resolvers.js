const Annonce = require('../models/Annonce');

exports.getAnnonces = async () => {
  return await Annonce.find({ publicationStatus: 'Publiée' });
};

exports.getAnnonceById = async (parent, args) => {
  return await Annonce.findById(args.id);
};

exports.addAnnonce = async (parent, args, context) => {
  const user = context.user;
  if (!user || !user.isAgent) {
    throw new Error('Utilisateur non autorisé');
  }
  
  const newAnnonce = new Annonce({
    title: args.title,
    propertyType: args.propertyType,
    publicationStatus: args.publicationStatus,
    propertyStatus: args.propertyStatus,
    description: args.description,
    price: args.price,
    availabilityDate: args.availabilityDate,
    userName: user.username,
  });

  return await newAnnonce.save();
};
