const router = require('express').Router();

router.post('/', (req, res) => res.json({ ok: true }));

module.exports = router;
