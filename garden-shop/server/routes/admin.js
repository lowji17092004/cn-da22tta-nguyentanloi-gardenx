const router = require('express').Router();

router.get('/', (req, res) => res.json({ admin: true }));

module.exports = router;
