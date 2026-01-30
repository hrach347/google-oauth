export const getDashboard = (req, res) => {
    if (!req.session.user) return res.status(401).json("LOGIN BITCH!");
    res.json(req.session.user);
}