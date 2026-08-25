import UserProfilePage, { generateMetadata } from "@/app/(marketing)/profile/[id]/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export { generateMetadata };
export default UserProfilePage;
