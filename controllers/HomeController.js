class HomeController {
  async index(req, res) {
    res.json({ message: 'API funcionando!' })
  }
}

export default new HomeController()
