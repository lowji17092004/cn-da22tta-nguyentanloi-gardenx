const router = require('express').Router();

router.post('/login', (req, res) => res.json({ ok: true }));
router.post('/register', (req, res) => res.json({ ok: true }));

module.exports = router;
