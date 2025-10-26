import type { ZormDatabase } from '@zorm-ts/core'
import type { App } from 'vue'
import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { watch } from 'vue'

export function setupZormDevtools(app: App, database: ZormDatabase): void {
  const inspectorId = 'zorm-database'
  const timelineLayerId = 'zorm-operations'

  setupDevtoolsPlugin({
    id: 'zorm-devtools-plugin',
    label: 'Zorm',
    packageName: 'zorm',
    homepage: 'https://github.com/joris-gallot/zorm',
    logo: 'https://zod.dev/logo.svg',
    componentStateTypes: [],
    app,
  }, (api) => {
    // Add the database inspector
    api.addInspector({
      id: inspectorId,
      label: 'Zorm',
      icon: 'storage',
    })

    // Add timeline layer for tracking operations
    api.addTimelineLayer({
      id: timelineLayerId,
      color: 0x42B883,
      label: 'Zorm Operations',
    })

    // Get inspector tree - list all entities
    api.on.getInspectorTree((payload) => {
      if (payload.inspectorId === inspectorId) {
        const dbData = database.getData()
        const entities = Object.keys(dbData)

        payload.rootNodes = entities.map((entityName) => {
          const entityData = dbData[entityName]
          const count = Object.keys(entityData || {}).length

          return {
            id: entityName,
            label: `${entityName} (${count})`,
            tags: [
              {
                label: `${count} records`,
                textColor: 0xFFFFFF,
                backgroundColor: count > 0 ? 0x42B883 : 0x999999,
              },
            ],
            children: Object.values(entityData || {}).map((record: any) => ({
              id: `${entityName}-${record.id}`,
              label: `#${record.id}`,
            })),
          }
        })
      }
    })

    // Get inspector state - show entity or record details
    api.on.getInspectorState((payload) => {
      if (payload.inspectorId === inspectorId) {
        const dbData = database.getData()

        // Check if it's a specific record (format: entityName-id)
        if (payload.nodeId.includes('-')) {
          const [entityName, recordId] = payload.nodeId.split('-')
          const entity = database.getEntity(entityName, recordId)

          if (entity) {
            payload.state = {
              'Record Details': Object.entries(entity).map(([key, value]) => ({
                key,
                value,
                editable: key !== 'id',
              })),
            }
          }
        }
        // It's an entity node
        else {
          const entityName = payload.nodeId
          const entityData = dbData[entityName]

          if (entityData) {
            const records = Object.values(entityData)
            const recordCount = records.length

            payload.state = {
              'Entity Info': [
                {
                  key: 'name',
                  value: entityName,
                  editable: false,
                },
                {
                  key: 'count',
                  value: recordCount,
                  editable: false,
                },
              ],
              'Records': records.map((record: any) => ({
                key: `Record #${record.id}`,
                value: record,
                editable: false,
              })),
            }
          }
        }
      }
    })

    // Edit inspector state
    api.on.editInspectorState((payload) => {
      if (payload.inspectorId === inspectorId && payload.nodeId.includes('-')) {
        const [entityName, recordId] = payload.nodeId.split('-')
        const { path, state } = payload

        if (path.length > 0) {
          const key = path[path.length - 1]
          database.setEntityKey(entityName, recordId, key, state.value)

          // Add timeline event
          api.addTimelineEvent({
            layerId: timelineLayerId,
            event: {
              time: Date.now(),
              data: {
                entity: entityName,
                recordId,
                field: key,
                newValue: state.value,
              },
              title: 'Field Updated',
              subtitle: `${entityName}#${recordId}.${key}`,
            },
          })

          // Refresh inspector
          api.sendInspectorState(inspectorId)
        }
      }
    })

    // Watch for database changes and notify inspector
    if (typeof database.getData === 'function') {
      const dbRef = database.getData()

      // For Vue reactive database
      if (dbRef && typeof dbRef === 'object' && '__v_isRef' in dbRef) {
        watch(() => database.getData(), () => {
          api.sendInspectorTree(inspectorId)
          api.sendInspectorState(inspectorId)
        }, { deep: true })
      }
    }
  })
}
