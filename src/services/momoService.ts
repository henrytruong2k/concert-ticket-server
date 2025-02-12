import crypto from "crypto";
import dotenv from "dotenv";
import axiosClient from "../configs/axiosClient";

dotenv.config();

interface MomoPaymentResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  shortLink: string;
}

const accessKey = process.env.PAYMENT_ACCESS_KEY;
const secretKey = process.env.PAYMENT_SECRET_KEY;
const baseUrl = process.env.PAYMENT_BASE_URL;
const momoUrl = process.env.PAYMENT_MOMO_URL;
const partnerCode = process.env.PAYMENT_PARTNER_CODE;

const createSignature = (rawSignature) =>
  crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

export const createMomoPayment = async (
  amount: string,
): Promise<MomoPaymentResponse> => {
  const orderInfo = "Thanh toán vé xem hoà nhạc";
  const redirectUrl = `${baseUrl}/ok`;
  const ipnUrl = `${baseUrl}/callback`;
  const requestType = "payWithMethod";
  const orderId = partnerCode + new Date().getTime();
  const requestId = orderId;
  const extraData = "";
  const orderGroupId = "";
  const autoCapture = true;
  const lang = "vi";
  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  const rawSignature = [
    `accessKey=${accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${partnerCode}`,
    `redirectUrl=${redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join("&");
  const signature = createSignature(rawSignature);

  const requestBody = {
    partnerCode,
    partnerName: "Đại lý bán vé",
    storeId: "MomoTestStore",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    orderGroupId,
    signature,
  };

  try {
    const { data } = await axiosClient.post<MomoPaymentResponse>(
      `${momoUrl}/v2/gateway/api/create`,
      requestBody,
      {
        headers: {
          "Content-Length": Buffer.byteLength(JSON.stringify(requestBody)),
        },
      },
    );
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
