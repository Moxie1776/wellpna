import { builder } from '../../builder'
import { prisma } from '../../client'
import { OperatorDataScraperService } from '../../services/operatorDataScraperService'

const scraperService = new OperatorDataScraperService(prisma)

// Define the ImportResult type
export const ImportResult = builder.objectRef<{
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}>('ImportResult')

builder.objectType(ImportResult, {
  fields: (t) => ({
    success: t.exposeBoolean('success'),
    imported: t.exposeInt('imported'),
    skipped: t.exposeInt('skipped'),
    errors: t.exposeStringList('errors'),
  }),
})

builder.mutationFields((t) => ({
  // Scrape and import operators for a specific state
  importOperators: t.field({
    type: ImportResult,
    args: {
      state: t.arg.string({ required: true }),
    },
    resolve: async (_parent, args) => {
      const state = args.state as 'TX' | 'NM'

      if (!['TX', 'NM'].includes(state)) {
        throw new Error('Invalid state. Must be TX or NM.')
      }

      return await scraperService.scrapeAndImport(state)
    },
  }),

  // Get import status/progress (placeholder for future implementation)
  getImportStatus: t.string({
    resolve: () => {
      return (
        'Import functionality is available. Use importOperators mutation to start an import.'
      )
    },
  }),
}))
