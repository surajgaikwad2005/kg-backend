/**
 * domain-configuration/documents/index.js
 * Barrel for the docs-exclusive CDM service layer.
 *
 *   import * as docs from '@/src/services/domain-configuration/documents';
 *   import { getDocumentTypes, getDocsKnowledgeGraph } from '@/src/services/domain-configuration/documents';
 *
 * Reading docs context is NOT here — see getContext('documents', ...) and
 * committing is NOT here either — see commitContext('documents', body), both
 * in domain-configuration/common/contextService.js.
 */
export * from './documentsService';
