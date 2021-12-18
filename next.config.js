const path = require('path')

module.exports = {
  reactStrictMode: true,
  env: {
    API_BASE_URL: 'https://octoplusapi.herokuapp.com',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3",  
    STRIPE_SECRET_KEY: "sk_test_tR3PYbcVNZZ796tH88S4VQ2u",
    STRIPE_WEBHOOK_SECRET: "whsec_1234"
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}