import { SignJWT, jwtVerify } from "jose";

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not set. Add it to your Azure App Service Application Settings."
    );
  }

  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function signToken(payload) {
  const secret = getJwtSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
}

export async function verifyToken(token) {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
