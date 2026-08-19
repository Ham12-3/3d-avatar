-- Preserve any existing session reference while making the storage provider-neutral.
ALTER TABLE "AvatarSession" RENAME COLUMN "runwayConversationId" TO "providerConversationId";
ALTER TABLE "AvatarSession" RENAME COLUMN "avatarId" TO "renderer";
ALTER TABLE "AvatarSession" ALTER COLUMN "renderer" SET DEFAULT 'browser-three';
ALTER INDEX "AvatarSession_runwayConversationId_key" RENAME TO "AvatarSession_providerConversationId_key";

-- Knowledge documents now live only in the application database.
DROP INDEX "KnowledgeDocument_runwayDocumentId_key";
ALTER TABLE "KnowledgeDocument" DROP COLUMN "runwayDocumentId";
