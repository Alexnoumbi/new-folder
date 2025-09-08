const Convention = require('../models/Convention');
const Enterprise = require('../models/Entreprise');

// @desc    Create a new convention
// @route   POST /api/conventions
exports.createConvention = async (req, res) => {
  try {
    const {
      enterpriseId,
      signedDate,
      startDate,
      endDate,
      type,
      advantages,
      obligations
    } = req.body;

    // Verify enterprise exists
    const enterprise = await Enterprise.findById(enterpriseId);
    if (!enterprise) {
      return res.status(404).json({ message: 'Enterprise not found' });
    }

    const convention = await Convention.create({
      enterprise: enterpriseId,
      signedDate,
      startDate,
      endDate,
      type,
      advantages,
      obligations,
      status: 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      data: convention
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating convention'
    });
  }
};

// @desc    Get all conventions
// @route   GET /api/conventions
exports.getConventions = async (req, res) => {
  try {
    const conventions = await Convention.find()
      .populate('enterprise', 'nom')
      .sort('-createdAt');

    res.json({
      success: true,
      data: conventions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conventions'
    });
  }
};

// @desc    Get single convention
// @route   GET /api/conventions/:id
exports.getConvention = async (req, res) => {
  try {
    const convention = await Convention.findById(req.params.id)
      .populate('enterprise', 'nom');

    if (!convention) {
      return res.status(404).json({
        success: false,
        message: 'Convention not found'
      });
    }

    res.json({
      success: true,
      data: convention
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching convention'
    });
  }
};

// @desc    Update convention
// @route   PUT /api/conventions/:id
exports.updateConvention = async (req, res) => {
  try {
    const convention = await Convention.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!convention) {
      return res.status(404).json({
        success: false,
        message: 'Convention not found'
      });
    }

    res.json({
      success: true,
      data: convention
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating convention'
    });
  }
};

// @desc    Update convention status
// @route   PATCH /api/conventions/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const convention = await Convention.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!convention) {
      return res.status(404).json({
        success: false,
        message: 'Convention not found'
      });
    }

    res.json({
      success: true,
      data: convention
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating convention status'
    });
  }
};

// @desc    Get enterprise conventions
// @route   GET /api/conventions/enterprise/:enterpriseId
exports.getEnterpriseConventions = async (req, res) => {
  try {
    const conventions = await Convention.find({
      enterprise: req.params.enterpriseId
    })
    .sort('-createdAt');

    res.json({
      success: true,
      data: conventions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enterprise conventions'
    });
  }
};

// @desc    Get active conventions for enterprise
// @route   GET /api/conventions/enterprise/:enterpriseId/active
exports.getActiveConventions = async (req, res) => {
  try {
    const conventions = await Convention.find({
      enterprise: req.params.enterpriseId,
      status: 'ACTIVE',
      endDate: { $gt: new Date() }
    }).sort('-startDate');

    res.json({
      success: true,
      data: conventions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active conventions'
    });
  }
};

// @desc    Add document to convention
// @route   POST /api/conventions/:id/documents
exports.addDocument = async (req, res) => {
  try {
    const convention = await Convention.findById(req.params.id);

    if (!convention) {
      return res.status(404).json({
        success: false,
        message: 'Convention not found'
      });
    }

    const { documentId, type } = req.body;

    convention.documents.push({
      documentId,
      type,
      addedAt: new Date(),
      addedBy: req.user.id
    });

    await convention.save();

    res.json({
      success: true,
      data: convention
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding document to convention'
    });
  }
};
