import OpenAI from "openai";
import { config } from "../config/env";

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY! });

export default openai;
