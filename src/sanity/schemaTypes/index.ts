import { type SchemaTypeDefinition } from "sanity";
import { authorType } from "./authorType";
import { articleType } from "./articleType";
import { eventType } from "./eventType";
import { eventCommentType } from "./eventCommentType";
import { speakerType } from "./speakerType";
import { partnerType } from "./partnerType";
import { coachType } from "./coachType";
import { resourceType } from "./resourceType";
import { impactStatsType } from "./impactStatsType";
import { productType } from "./productType";
import { videoType } from "./videoType";
import { voicesType } from "./voicesType";

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [authorType, articleType, eventType, eventCommentType, speakerType, partnerType, coachType, resourceType, impactStatsType, productType, videoType, voicesType],
};
