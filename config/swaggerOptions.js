module.exports = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce APIs",
      version: "0.1.0",
      description:
        "This is a multivendor ecommerce application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "myrat-sahedow",
        url: "https://github.com/msahedov",
        email: "m.sahedow13@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./routes/authRoutes.js"],
}