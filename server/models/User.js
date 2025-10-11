const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide']
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false
  },
  typeCompte: {
    type: String,
    enum: ['admin', 'entreprise'],
    required: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  entrepriseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entreprise',
    required: false
  },
  entrepriseIncomplete: {
    type: Boolean,
    default: false
  },
  telephone: {
    type: String,
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  adresse: {
    type: String,
    default: ''
  },
  ville: {
    type: String,
    default: ''
  },
  pays: {
    type: String,
    default: ''
  },
  codePostal: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ entrepriseId: 1 });
userSchema.index({ role: 1 });

userSchema.virtual('nomComplet').get(function() {
  return `${this.prenom} ${this.nom}`;
});

// Middleware pre-save pour hasher le mot de passe (unique)
userSchema.pre('save', async function (next) {
  if (!this.isModified('motDePasse')) return next();
  try {
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe (unique)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.motDePasse);
};

// Méthode pour obtenir le profil public
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.motDePasse;
  delete userObject.tokenVerification;
  delete userObject.tokenResetMotDePasse;
  delete userObject.dateExpirationReset;
  return userObject;
};

// Méthode statique pour trouver un utilisateur par email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Méthode pour vérifier si l'utilisateur est admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin' || this.role === 'super_admin';
};

module.exports = mongoose.model('User', userSchema);
