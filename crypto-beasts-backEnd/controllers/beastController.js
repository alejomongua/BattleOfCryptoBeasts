const admin = require("firebase-admin");
const authHelper = require('../helper/authHelper');

/**
 * GET /message
 * 
*/
exports.getMessageToSign = async (req,res) => {
  try {
    const { address } = req.query;

    if (!authHelper.isValidEthAddress(address)) {
      res.status(500).send({ error: "invalid_address" });
    }

    const randomString = authHelper.makeId(20);
    let messageToSign = `Wallet address: ${address} Nonce: ${randomString}`;

    // Get user data from firestore database
    const user = await admin.firestore().collection("users").doc(address).get();

    if (user.data() && user.data().messageToSign) {
      // messageToSign already exists for that particular wallet address
      messageToSign = user.data().messageToSign;
    } else {
      // messageToSign doesn't exist, save it to firestore database
      admin.firestore().collection("users").doc(address).set(
        {
          messageToSign,
        },
        {
          merge: true,
        }
      );
    }

    res.send({ messageToSign, error: null });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "server_error" });
  }
}


/**
 * GET /jwt
 * 
*/
exports.jwt = async (req,res) => {
  try {
    const { address, signature } = req.query;

    if (!authHelper.isValidEthAddress(address) || !signature) {
      res.send({ error: "invalid_parameters" });
    }

    const [customToken, doc] = await Promise.all([
      admin.auth().createCustomToken(address),
      admin.firestore().collection("users").doc(address).get(),
    ]);

    if (!doc.exists) {
      res.send({ error: "invalid_message_to_sign" });
    }

    const { messageToSign } = doc.data();

    if (!messageToSign) {
      res.send({ error: "invalid_message_to_sign" });
    }

    const validSignature = authHelper.isValidSignature(address, signature, messageToSign);

    if (!validSignature) {
      res.send({ error: "invalid_signature" });
    }

    // Delete messageToSign as it can only be used once
    admin.firestore().collection("users").doc(address).set(
      {
        messageToSign: null,
      },
      {
        merge: true,
      }
    );

    res.send({ customToken, error: null });
  } catch (err) {
    console.log("Error:", err);
    res.send({ error: "server_error" });
  }
}
