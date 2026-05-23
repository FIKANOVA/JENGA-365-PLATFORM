import { type SchemaTypeDefinition } from "sanity";
import { authorType } from "./authorType";
import { articleType } from "./articleType";
import { eventType } from "./eventType";
import { eventCommentType } from "./eventCommentType";
import { speakerType } from "./speakerType";
import { partnerType } from "./partnerType";
import { coachType } from "./coachType";
import { resourceType } from "./resourceType";
import { productType } from "./productType";
import { videoType } from "./videoType";
import { voicesType } from "./voicesType";
import { siteSettingsType } from "./siteSettingsType";
import { teamOfficialType } from "./teamOfficialType";
import { helpTopicType } from "./helpTopicType";
import { userManualType } from "./userManualType";

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [
        siteSettingsType,
        teamOfficialType,
        authorType,
        articleType,
        eventType,
        eventCommentType,
        speakerType,
        partnerType,
        coachType,
        resourceType,
        productType,
        videoType,
        voicesType,
        helpTopicType,
        userManualType,
    ],
};
