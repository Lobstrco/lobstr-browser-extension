import { signPromptState } from "../../helpers/signPrompt";
import { SignPromptState } from "@shared/constants/mesagesData.types";

export function loadSignPromptState(): Promise<SignPromptState> {
    return Promise.resolve(signPromptState());
}
