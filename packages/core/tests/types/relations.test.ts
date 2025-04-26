/* eslint-disable ts/consistent-type-definitions */
import type { ZodNumber, ZodObject, ZodString } from 'zod'
import type { ActualRelations, EntityWithOptionalRelations, GetRelationEntitiesName, TypeOfRelations, WithRelationsOption } from '../../src/orm'
import { assertType, describe, it } from 'vitest'

describe('relations typing', () => {
  it('relations - one level', () => {
    interface UserEntity {
      name: 'user'
      zodSchema: ZodObject<{
        id: ZodNumber
        name: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        name: {
          zodType: ZodString
          name: 'name'
        }
      }
    }

    interface PostEntity {
      name: 'post'
      zodSchema: ZodObject<{
        id: ZodNumber
        name: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        name: {
          zodType: ZodString
          name: 'name'
        }
      }
    }

    type Relations = {
      user: {
        posts: {
          kind: 'many'
          field: {
            zodType: ZodNumber
            name: 'id'
          }
          reference: {
            entity: PostEntity
            field: {
              zodType: ZodNumber
              name: 'id'
            }
          }
        }
      }
    }

    type UserWithRelationsOption = WithRelationsOption<UserEntity, Relations>

    assertType<UserWithRelationsOption>({
      posts: true,
    })
    assertType<UserWithRelationsOption>({
      posts: false,
    })
    assertType<UserWithRelationsOption>({
      posts: undefined,
    })
    assertType<UserWithRelationsOption>({
      // @ts-expect-error should be true
      posts: 'true',
    })
    assertType<UserWithRelationsOption>({
      // @ts-expect-error should be true
      posts: 1,
    })
    assertType<UserWithRelationsOption>({
      // @ts-expect-error should be true
      posts: {
        user: true,
      },
    })

    type UserWithAllRelations = ActualRelations<UserEntity, Relations>

    assertType<UserWithAllRelations>({
      // @ts-expect-error should be true
      posts: false,
    })
    assertType<UserWithAllRelations>({
      // @ts-expect-error should be true
      posts: undefined,
    })
    assertType<UserWithAllRelations>({
      // @ts-expect-error should be true
      posts: 'true',
    })
    assertType<UserWithAllRelations>({
      // @ts-expect-error should be true
      posts: 1,
    })
    assertType<UserWithAllRelations>({
      posts: {
        // @ts-expect-error invalid property
        user: true,
      },
    })

    assertType<UserWithAllRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
        // @ts-expect-error should be a valid property
        user: {
          id: 1,
          name: 'user 1',
        },
      }],
    })
    assertType<UserWithAllRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
      }],
    })

    // @ts-expect-error should be a boolean
    type _Invalid = TypeOfRelations<UserEntity, Relations, {
      // eslint-disable-next-line ts/no-empty-object-type
      posts: {}
    }>

    // @ts-expect-error should be a boolean
    type _Invalid2 = TypeOfRelations<UserEntity, Relations, {
      posts: { foo: true }
    }>

    // @ts-expect-error should be a boolean
    type _Invalid3 = TypeOfRelations<UserEntity, Relations, {
      posts: 'foo'
    }>

    type UserWithRelations = TypeOfRelations<UserEntity, Relations, {
      posts: true
    }>

    assertType<UserWithRelations>({
      posts: [],
    })
    assertType<UserWithRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
      }],
    })
    assertType<UserWithRelations>({
      posts: [{
        id: 1,
        // @ts-expect-error should be a string
        name: 1,
      }],
    })
    assertType<UserWithRelations>({
      // @ts-expect-error should be an array of posts
      posts: [''],
    })
    assertType<UserWithRelations>({
      // @ts-expect-error should be an array of posts
      posts: [1],
    })
    assertType<UserWithRelations>({
      // @ts-expect-error should be an array of posts
      posts: {},
    })

    type UserWithOptionalRelations = EntityWithOptionalRelations<UserEntity, Relations>

    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      // @ts-expect-error should be an array of posts
      posts: [{}],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      // @ts-expect-error should be an array of posts
      posts: [3],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [{
        id: 1,
        name: 'post 1',
      }],
    })
  })

  it('relations - two level', () => {
    interface UserEntity {
      name: 'user'
      zodSchema: ZodObject<{
        id: ZodNumber
        name: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        name: {
          zodType: ZodString
          name: 'name'
        }
      }
    }

    interface PostEntity {
      name: 'post'
      zodSchema: ZodObject<{
        id: ZodNumber
        name: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        name: {
          zodType: ZodString
          name: 'name'
        }
      }
    }

    interface CommentEntity {
      name: 'comment'
      zodSchema: ZodObject<{
        id: ZodNumber
        content: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        content: {
          zodType: ZodString
          name: 'content'
        }
      }
    }

    interface SettingsEntity {
      name: 'settings'
      zodSchema: ZodObject<{
        id: ZodNumber
        name: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
      }
    }

    type Relations = {
      user: {
        posts: {
          kind: 'many'
          field: {
            zodType: ZodNumber
            name: 'id'
          }
          reference: {
            entity: PostEntity
            field: {
              zodType: ZodNumber
              name: 'id'
            }
          }
        }
        settings: {
          kind: 'one'
          field: {
            zodType: ZodNumber
            name: 'id'
          }
          reference: {
            entity: SettingsEntity
            field: {
              zodType: ZodNumber
              name: 'id'
            }
          }
        }
      }
      post: {
        user: {
          kind: 'one'
          field: {
            zodType: ZodNumber
            name: 'id'
          }
          reference: {
            entity: UserEntity
            field: {
              zodType: ZodNumber
              name: 'id'
            }
          }
        }
        comments: {
          kind: 'many'
          field: {
            zodType: ZodNumber
            name: 'id'
          }
          reference: {
            entity: CommentEntity
            field: {
              zodType: ZodNumber
              name: 'id'
            }
          }
        }
      }
      settings: {
        user: {
          kind: 'one'
          field: {
            zodType: ZodNumber
            name: 'id'
          }
          reference: {
            entity: UserEntity
            field: {
              zodType: ZodNumber
              name: 'id'
            }
          }
        }
      }
    }

    type UserWithRelationsOption = WithRelationsOption<UserEntity, Relations>

    assertType<UserWithRelationsOption>({
      posts: true,
    })
    assertType<UserWithRelationsOption>({
      posts: false,
    })
    assertType<UserWithRelationsOption>({
      posts: {
        comments: true,
      },
    })
    assertType<UserWithRelationsOption>({
      posts: {
        comments: false,
      },
    })
    assertType<UserWithRelationsOption>({
      posts: {
        comments: undefined,
      },
    })
    assertType<UserWithRelationsOption>({
      posts: undefined,
    })

    assertType<UserWithRelationsOption>({
      posts: {
        // @ts-expect-error can't load user relation within a user query
        user: true,
      },
    })
    assertType<UserWithRelationsOption>({
      // @ts-expect-error should be true
      posts: 'true',
    })
    assertType<UserWithRelationsOption>({
      // @ts-expect-error should be true
      posts: 1,
    })
    assertType<UserWithRelationsOption>({
      posts: true,
      // @ts-expect-error invalid relation
      invalid: true,
    })
    assertType<UserWithRelationsOption>({
      posts: {
        // @ts-expect-error should be a boolean or undefined
        comments: {},
      },
    })
    assertType<UserWithRelationsOption>({
      posts: {
        comments: true,
        // @ts-expect-error foo is not a relation
        foo: true,
      },
    })

    type UserWithAllRelations = ActualRelations<UserEntity, Relations>

    assertType<UserWithAllRelations>({
      posts: {
        // @ts-expect-error should be a valid property
        comments: true,
      },
      // @ts-expect-error should be a valid property
      settings: true,
    })
    assertType<UserWithAllRelations>({
      posts: [{
        // @ts-expect-error foo is not a relation
        foo: true,
      }],
    })
    assertType<UserWithAllRelations>({
      // @ts-expect-error should an object with comments
      posts: true,
    })
    assertType<UserWithAllRelations>({
      // @ts-expect-error should be true
      posts: undefined,
    })
    assertType<UserWithAllRelations>({
      // @ts-expect-error should be true
      posts: 'true',
    })
    assertType<UserWithAllRelations>({
      // @ts-expect-error should be true
      posts: 1,
    })
    assertType<UserWithAllRelations>({
      // @ts-expect-error should be true
      settings: {},
    })

    assertType<UserWithAllRelations>({
      settings: {
        id: 1,
        name: 'settings 1',
      },
      posts: [{
        id: 1,
        name: 'post 1',
        // @ts-expect-error can't load user relation within a user query
        user: {
          id: 1,
          name: 'user 1',
        },
      }],
    })
    assertType<UserWithAllRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
      }],
      settings: {
        id: 1,
        name: 'settings 1',
      },
    })

    type _Invalid = TypeOfRelations<UserEntity, Relations, {
      // can't valid all relations as it must extends the relations option
      posts: { comments: true, invalid: true }
    }>

    // @ts-expect-error invalid is not a relation
    type _Invalid2 = TypeOfRelations<UserEntity, Relations, {
      // eslint-disable-next-line ts/no-empty-object-type
      posts: { comments: {} }
    }>

    // @ts-expect-error invalid is not a relation
    type _Invalid3 = TypeOfRelations<UserEntity, Relations, {
      posts: { comments: 1 }
    }>

    type UserWithRelations = TypeOfRelations<UserEntity, Relations, {
      posts: {
        comments: true
      }
      settings: true
    }>

    assertType<UserWithRelations>({
      posts: [],
      settings: {
        id: 1,
        name: 'settings 1',
      },
    })
    assertType<UserWithRelations>({
      posts: [],
      // @ts-expect-error should be a valid settings
      settings: {},
    })
    assertType<UserWithRelations>({
      // @ts-expect-error should be an array of posts
      posts: [''],
    })
    assertType<UserWithRelations>({
      // @ts-expect-error should be an array of posts
      posts: [1],
    })
    assertType<UserWithRelations>({
      // @ts-expect-error should be an array of posts
      posts: {},
    })
    assertType<UserWithRelations>({
      // @ts-expect-error comments is missing
      posts: [{
        id: 1,
        name: 'post 1',
      }],
    })
    assertType<UserWithRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
        comments: [],
      }],
      settings: {
        id: 1,
        name: 'settings 1',
      },
    })
    assertType<UserWithRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
        comments: [{
          id: 1,
          content: 'comment 1',
        }],
      }],
      settings: {
        id: 1,
        name: 'settings 1',
      },
    })
    assertType<UserWithRelations>({
      posts: [{
        id: 1,
        // @ts-expect-error should be a string
        name: 1,
        // @ts-expect-error should be an array of comments
        comments: {},
      }],
    })
    assertType<UserWithRelations>({
      posts: [{
        id: 1,
        // @ts-expect-error should be a string
        name: 1,
        // @ts-expect-error should be an array of comments
        comments: [{}],
      }],
    })

    type UserWithOptionalRelations = EntityWithOptionalRelations<UserEntity, Relations>

    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      // @ts-expect-error should be an array of posts
      posts: [{}],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      // @ts-expect-error should be an array of posts
      posts: [3],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [{
        id: 1,
        name: 'post 1',
      }],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [{
        id: 1,
        name: 'post 1',
        // @ts-expect-error should be an array of comments
        comments: [3],
      }],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [{
        id: 1,
        name: 'post 1',
        // @ts-expect-error should be an array of comments
        comments: [{}],
      }],
    })

    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [{
        id: 1,
        name: 'post 1',
        // @ts-expect-error can't load user relation within a user query
        user: {
          id: 1,
          name: 'user 1',
        },
        comments: [],
      }],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [{
        id: 1,
        name: 'post 1',
        comments: [
          {
            id: 1,
            content: 'comment 1',
          },
        ],
      }],
    })

    type PostWithAllRelations = ActualRelations<PostEntity, Relations>

    assertType<PostWithAllRelations>({
      // @ts-expect-error should be a valid user
      user: {},
    })
    assertType<PostWithAllRelations>({
      // @ts-expect-error should be an object
      user: true,
    })
    assertType<PostWithAllRelations>({
      user: {
        id: 1,
        name: 'user 1',
      },
      // @ts-expect-error should be an array of comments
      comments: true,
    })

    assertType<PostWithAllRelations>({
      user: {
        id: 1,
        name: 'user 1',
        // @ts-expect-error can't load posts relation within a post query
        posts: [],
      },
      comments: [
        // @ts-expect-error should be a valid comment
        {},
      ],
    })
    assertType<PostWithAllRelations>({
      user: {
        id: 1,
        name: 'user 1',
      },
      comments: [
        {
          id: 1,
          content: 'comment 1',
        },
      ],
    })

    type PostRelationsObject = TypeOfRelations<PostEntity, Relations, {
      comments: true
      user: {
        settings: true
      }
    }>

    assertType<PostRelationsObject>({
      user: {
        id: 1,
        name: 'user 1',
        settings: {
          id: 1,
          name: 'settings 1',
        },
      },
      comments: [{
        id: 1,
        content: 'comment 1',
      }],
    })

    assertType<PostRelationsObject>({
      user: {
        id: 1,
        name: 'user 1',
        // @ts-expect-error can't load posts relation within a post query
        posts: [],
        settings: {
          id: 1,
          name: 'settings 1',
        },
      },
      comments: [{
        id: 1,
        content: 'comment 1',
      }],
    })
    assertType<PostRelationsObject>({
      user: {
        id: 1,
        name: 'user 1',
        posts: [],
        // @ts-expect-error should be a valid settings
        settings: {},
      },
      comments: [],
    })
    assertType<PostRelationsObject>({
      // @ts-expect-error should be a valid user
      user: {
        id: 1,
        name: 'user 1',
      },
      // @ts-expect-error should be an array of comments
      comments: [{}],
    })
    assertType<PostRelationsObject>({
      // @ts-expect-error should be a valid user
      user: {},
    })
    assertType<PostRelationsObject>({
      // @ts-expect-error should be a valid user
      user: 1,
    })

    type PostWithOptionalRelations = EntityWithOptionalRelations<PostEntity, Relations>

    assertType<PostWithOptionalRelations>({
      id: 1,
      name: 'post 1',
    })
    assertType<PostWithOptionalRelations>({
      id: 1,
      name: 'post 1',
      user: {
        id: 1,
        name: 'user 1',
      },
    })
    assertType<PostWithOptionalRelations>({
      id: 1,
      name: 'post 1',
      comments: [{
        id: 1,
        content: 'comment 1',
      }],
    })
    assertType<PostWithOptionalRelations>({
      id: 1,
      name: 'post 1',
      user: {
        id: 1,
        name: 'user 1',
      },
      comments: [{
        id: 1,
        content: 'comment 1',
      }],
    })
    assertType<PostWithOptionalRelations>({
      id: 1,
      name: 'post 1',
      // @ts-expect-error should be a valid user
      user: {
        id: 1,
      },
      comments: [
        // @ts-expect-error should be a valid comment
        {
          content: 'comment 1',
        },
      ],
    })
    assertType<PostWithOptionalRelations>({
      id: 1,
      name: 'post 1',
      // @ts-expect-error should be a valid user
      user: 1,
      // @ts-expect-error should be an array of comments
      comments: [{}],
    })

    assertType<PostWithOptionalRelations>({
      id: 1,
      name: 'post 1',
      user: {
        id: 1,
        name: 'user 1',
        // @ts-expect-error can't load posts relation within a post query
        posts: [],
      },
    })

    type SettingsWithAllRelations = ActualRelations<SettingsEntity, Relations>

    assertType<SettingsWithAllRelations>({
      // @ts-expect-error should be a valid user
      user: {},
    })
    assertType<SettingsWithAllRelations>({
      user: {
        id: 1,
        name: 'user 1',
        // @ts-expect-error should be an array of posts
        posts: true,
      },
    })

    assertType<SettingsWithAllRelations>({
      user: {
        id: 1,
        name: 'user 1',
        posts: [
          // @ts-expect-error should be a valid post
          {},
        ],
      },
    })
    assertType<SettingsWithAllRelations>({
      user: {
        id: 1,
        name: 'user 1',
        posts: [
          {
            id: 1,
            name: 'post 1',
          },
        ],
        // @ts-expect-error can't load settings relation within a user query
        settings: {
          id: 1,
          name: 'settings 1',
        },
      },
    })

    type SettingsRelationsObject = TypeOfRelations<SettingsEntity, Relations, {
      user: {
        posts: {
          comments: true
        }
      }
    }>

    assertType<SettingsRelationsObject>({
      user: {
        id: 1,
        name: 'user 1',
        posts: [
          {
            id: 1,
            name: 'post 1',
            comments: [
              {
                id: 1,
                content: 'comment 1',
              },
            ],
          },
        ],
      },
    })
    assertType<SettingsRelationsObject>({
      user: {
        id: 1,
        name: 'user 1',
        // @ts-expect-error should be an array of posts
        posts: {},
      },
    })
    assertType<SettingsRelationsObject>({
      user: {
        id: 1,
        name: 'user 1',
        posts: [{
          id: 1,
          name: 'post 1',
          // @ts-expect-error should be an array of comments
          comments: {},
        }],
      },
    })
    assertType<SettingsRelationsObject>({
      // @ts-expect-error should be a valid user
      user: {},
    })
    assertType<SettingsRelationsObject>({
      // @ts-expect-error should be a valid user
      user: 1,
    })

    type SettingsWithOptionalRelations = EntityWithOptionalRelations<SettingsEntity, Relations>

    assertType<SettingsWithOptionalRelations>({
      id: 1,
      name: 'settings 1',
    })
    assertType<SettingsWithOptionalRelations>({
      id: 1,
      name: 'settings 1',
      user: {
        id: 1,
        name: 'user 1',
      },
    })
    assertType<SettingsWithOptionalRelations>({
      id: 1,
      name: 'settings 1',
      // @ts-expect-error should be a valid user
      user: 1,
    })
  })

  it('relations - two level - with multiple references in relations', () => {
    interface UserEntity {
      name: 'user'
      zodSchema: ZodObject<{
        id: ZodNumber
        name: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        name: {
          zodType: ZodString
          name: 'name'
        }
      }
    }

    interface PostEntity {
      name: 'post'
      zodSchema: ZodObject<{
        id: ZodNumber
        name: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        name: {
          zodType: ZodString
          name: 'name'
        }
      }
    }

    interface CommentEntity {
      name: 'comment'
      zodSchema: ZodObject<{
        id: ZodNumber
        content: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        content: {
          zodType: ZodString
          name: 'content'
        }
      }
    }

    type Relations = {
      user: {
        posts: {
          kind: 'many'
          field: {
            zodType: ZodNumber
            name: 'id'
          }
          reference: {
            entity: PostEntity
            field: {
              zodType: ZodNumber
              name: 'id'
            }
          }
        }
      }
      post: {
        user: {
          kind: 'one'
          field: {
            zodType: ZodNumber
            name: 'id'
          }
          reference: {
            entity: UserEntity
            field: {
              zodType: ZodNumber
              name: 'id'
            }
          }
        }
        comments: {
          kind: 'many'
          field: {
            zodType: ZodNumber
            name: 'id'
          }
          reference: {
            entity: CommentEntity
            field: {
              zodType: ZodNumber
              name: 'id'
            }
          }
        }
      }
    }

    type UserRelationEntitiesName = GetRelationEntitiesName<UserEntity, Relations>

    // @ts-expect-error should be entity name
    assertType<UserRelationEntitiesName>('posts')
    assertType<UserRelationEntitiesName>('post')

    type PostRelationEntitiesName = GetRelationEntitiesName<PostEntity, Relations>

    assertType<PostRelationEntitiesName>('user')
    // @ts-expect-error should be entity name
    assertType<PostRelationEntitiesName>('users')
    assertType<PostRelationEntitiesName>('comment')
    // @ts-expect-error should be entity name
    assertType<PostRelationEntitiesName>('comments')

    type CommentRelationEntitiesName = GetRelationEntitiesName<CommentEntity, Relations>

    // @ts-expect-error should be entity name
    assertType<CommentRelationEntitiesName>('whatever')

    type UserWithRelationsOption = WithRelationsOption<UserEntity, Relations>

    assertType<UserWithRelationsOption>({
      posts: true,
    })
    assertType<UserWithRelationsOption>({
      posts: false,
    })
    assertType<UserWithRelationsOption>({
      posts: {
        comments: true,
      },
    })
    assertType<UserWithRelationsOption>({
      posts: {
        comments: false,
      },
    })
    assertType<UserWithRelationsOption>({
      posts: {
        comments: undefined,
      },
    })
    assertType<UserWithRelationsOption>({
      posts: undefined,
    })
    assertType<UserWithRelationsOption>({
      posts: {
        // @ts-expect-error can't be a recursive relation
        user: true,
      },
    })
    assertType<UserWithRelationsOption>({
      posts: {
        // @ts-expect-error can't be a recursive relation
        user: {
          posts: true,
        },
      },
    })
    assertType<UserWithRelationsOption>({
      // @ts-expect-error should be true
      posts: 'true',
    })
    assertType<UserWithRelationsOption>({
      // @ts-expect-error should be true
      posts: 1,
    })

    assertType<UserWithRelationsOption>({
      posts: {
        // @ts-expect-error should be a boolean or undefined
        comments: {},
      },
    })
    assertType<UserWithRelationsOption>({
      posts: {
        comments: true,
        // @ts-expect-error foo is not a relation
        foo: true,
      },
    })

    type UserWithAllRelations = ActualRelations<UserEntity, Relations>

    assertType<UserWithAllRelations>({
      // @ts-expect-error should be an object
      posts: {},
    })
    assertType<UserWithAllRelations>({
      // @ts-expect-error should be an array of posts
      posts: [{}],
    })
    assertType<UserWithAllRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
        // @ts-expect-error should be an array of comments
        comments: true,
      }],
    })
    assertType<UserWithAllRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
        // @ts-expect-error should be an array of comments
        comments: [{}],
      }],
    })

    assertType<UserWithAllRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
        // @ts-expect-error can't load user relation within a user query
        user: {
          id: 1,
          name: 'user 1',
        },
        comments: [],
      }],
    })
    assertType<UserWithAllRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
        comments: [
          {
            id: 1,
            content: 'comment 1',
          },
        ],
      }],
    })

    type _Invalid = TypeOfRelations<UserEntity, Relations, {
      // can't valid all relations as it must extends the relations option
      posts: { comments: true, invalid: true }
    }>

    // @ts-expect-error invalid is not a relation
    type _Invalid2 = TypeOfRelations<UserEntity, Relations, {
      // eslint-disable-next-line ts/no-empty-object-type
      posts: { comments: {} }
    }>

    // @ts-expect-error invalid is not a relation
    type _Invalid3 = TypeOfRelations<UserEntity, Relations, {
      posts: { comments: 1 }
    }>

    type UserWithRelations = TypeOfRelations<UserEntity, Relations, {
      posts: {
        comments: true
      }
    }>

    assertType<UserWithRelations>({
      posts: [],
    })
    assertType<UserWithRelations>({
      // @ts-expect-error should be an array of posts
      posts: [''],
    })
    assertType<UserWithRelations>({
      // @ts-expect-error should be an array of posts
      posts: [1],
    })
    assertType<UserWithRelations>({
      // @ts-expect-error should be an array of posts
      posts: {},
    })
    assertType<UserWithRelations>({
      // @ts-expect-error comments is missing
      posts: [{
        id: 1,
        name: 'post 1',
      }],
    })
    assertType<UserWithRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
        comments: [],
      }],
    })
    assertType<UserWithRelations>({
      posts: [{
        id: 1,
        name: 'post 1',
        comments: [{
          id: 1,
          content: 'comment 1',
        }],
      }],
    })
    assertType<UserWithRelations>({
      posts: [{
        id: 1,
        // @ts-expect-error should be a string
        name: 1,
        // @ts-expect-error should be an array of comments
        comments: {},
      }],
    })
    assertType<UserWithRelations>({
      posts: [{
        id: 1,
        // @ts-expect-error should be a string
        name: 1,
        // @ts-expect-error should be an array of comments
        comments: [{}],
      }],
    })

    type UserWithOptionalRelations = EntityWithOptionalRelations<UserEntity, Relations>

    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      // @ts-expect-error should be an array of posts
      posts: [{}],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      // @ts-expect-error should be an array of posts
      posts: [3],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [{
        id: 1,
        name: 'post 1',
      }],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [{
        id: 1,
        name: 'post 1',
        // @ts-expect-error should be an array of comments
        comments: [3],
      }],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [{
        id: 1,
        name: 'post 1',
        // @ts-expect-error should be an array of comments
        comments: [{}],
      }],
    })
    assertType<UserWithOptionalRelations>({
      id: 1,
      name: 'user 1',
      posts: [{
        id: 1,
        name: 'post 1',
        comments: [
          {
            id: 1,
            content: 'comment 1',
          },
        ],
      }],
    })

    type PostWithAllRelations = ActualRelations<PostEntity, Relations>

    assertType<PostWithAllRelations>({
      // @ts-expect-error should be an object
      user: true,
      // @ts-expect-error should be an array of comments
      comments: true,
    })
    assertType<PostWithAllRelations>({
      user: {
        // @ts-expect-error should be a boolean
        posts: {
          comments: true,
        },
      },
      comments: [],
    })
    assertType<PostWithAllRelations>({
      user: {
        id: 1,
        name: 'user 1',
        // @ts-expect-error can't load posts relation within a user post
        posts: [],
      },
      // @ts-expect-error should be a boolean
      comments: {},
    })
  })

  it('relations - many to many', () => {
    interface PostEntity {
      name: 'post'
      zodSchema: ZodObject<{
        id: ZodNumber
        title: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        title: {
          zodType: ZodString
          name: 'title'
        }
      }
    }

    interface TagEntity {
      name: 'tag'
      zodSchema: ZodObject<{
        id: ZodNumber
        name: ZodString
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        name: {
          zodType: ZodString
          name: 'name'
        }
      }
    }

    interface PostTagEntity {
      name: 'postTag'
      zodSchema: ZodObject<{
        id: ZodNumber
        postId: ZodNumber
        tagId: ZodNumber
      }>
      fields: {
        id: {
          zodType: ZodNumber
          name: 'id'
        }
        postId: {
          zodType: ZodNumber
          name: 'postId'
        }
        tagId: {
          zodType: ZodNumber
          name: 'tagId'
        }
      }
    }

    type Relations = {
      post: {
        postTags: {
          kind: 'many'
          field: PostEntity['fields']['id']
          reference: {
            entity: PostTagEntity
            field: PostTagEntity['fields']['postId']
          }
        }
      }
      tag: {
        postsTags: {
          kind: 'many'
          field: TagEntity['fields']['id']
          reference: {
            entity: PostTagEntity
            field: PostTagEntity['fields']['tagId']
          }
        }
      }
      postTag: {
        post: {
          kind: 'one'
          field: PostTagEntity['fields']['postId']
          reference: {
            entity: PostEntity
            field: PostEntity['fields']['id']
          }
        }
        tag: {
          kind: 'one'
          field: PostTagEntity['fields']['tagId']
          reference: {
            entity: TagEntity
            field: TagEntity['fields']['id']
          }
        }
      }
    }

    type PostWithRelationsOption = WithRelationsOption<PostEntity, Relations>

    assertType<PostWithRelationsOption>({ postTags: true })
    assertType<PostWithRelationsOption>({ postTags: false })
    assertType<PostWithRelationsOption>({ postTags: undefined })
    assertType<PostWithRelationsOption>({
      postTags: {
        tag: true,
      },
    })
    assertType<PostWithRelationsOption>({
      postTags: {
        // @ts-expect-error can't load postTags from tag
        tag: {},
      },
    })
    assertType<PostWithRelationsOption>({
      postTags: {
        // @ts-expect-error can't load post relation within postTag query
        post: true,
      },
    })
    assertType<PostWithRelationsOption>({
      postTags: {
        // @ts-expect-error 'invalid' is not a relation of postTag
        invalid: true,
      },
    })
    assertType<PostWithRelationsOption>({
      // @ts-expect-error value should be boolean or object
      postTags: 'true',
    })

    type PostWithAllRelations = ActualRelations<PostEntity, Relations>

    assertType<PostWithAllRelations>({ postTags: [] })
    assertType<PostWithAllRelations>({
      postTags: [{
        id: 1,
        postId: 1,
        tagId: 1,
      }],
    })
    assertType<PostWithAllRelations>({
      postTags: [{
        id: 1,
        postId: 1,
        tagId: 1,
        // @ts-expect-error should be a valid tag
        tag: true,
      }],
    })
    assertType<PostWithAllRelations>({
      postTags: [{
        id: 1,
        postId: 1,
        tagId: 1,
        tag: {
          id: 1,
          name: 'Tech',
        },
      }],
    })

    type PostRelationObject = TypeOfRelations<PostEntity, Relations, {
      postTags: {
        tag: true
      }
    }>

    assertType<PostRelationObject>({ postTags: [] })
    assertType<PostRelationObject>({
      postTags: [
        // @ts-expect-error tag property is missing
        {
          id: 1,
          postId: 1,
          tagId: 1,
        },
      ],
    })
    assertType<PostRelationObject>({
      postTags: [{
        id: 1,
        postId: 1,
        tagId: 1,
        tag: {
          id: 1,
          name: 'Tech',
        },
      }],
    })
    assertType<PostRelationObject>({
      postTags: [{
        id: 1,
        postId: 1,
        tagId: 1,
        tag: {
          id: 1,
          // @ts-expect-error name should be string
          name: 123,
        },
      }],
    })

    type PostWithOptionalRelations = EntityWithOptionalRelations<PostEntity, Relations>

    assertType<PostWithOptionalRelations>({
      id: 1,
      title: 'Post 1',
    })
    assertType<PostWithOptionalRelations>({
      id: 1,
      title: 'Post 1',
      postTags: [{
        id: 1,
        postId: 1,
        tagId: 1,
      }],
    })
    assertType<PostWithOptionalRelations>({
      id: 1,
      title: 'Post 1',
      postTags: [{
        id: 1,
        postId: 1,
        tagId: 1,
        tag: {
          id: 1,
          name: 'Tech',
        },
      }],
    })
    assertType<PostWithOptionalRelations>({
      id: 1,
      title: 'Post 1',
      // @ts-expect-error postTags should be array of PostTagEntity
      postTags: [{}],
    })

    type TagWithRelationsOption = WithRelationsOption<TagEntity, Relations>

    assertType<TagWithRelationsOption>({ postsTags: true })
    assertType<TagWithRelationsOption>({ postsTags: false })
    assertType<TagWithRelationsOption>({
      postsTags: {
        post: true,
      },
    })
    assertType<TagWithRelationsOption>({
      postsTags: {
        // @ts-expect-error can't load postsTags from post
        post: {},
      },
    })
    assertType<TagWithRelationsOption>({
      postsTags: {
        // @ts-expect-error can't load tag relation within tag query
        tag: true,
      },
    })

    type TagWithAllRelations = ActualRelations<TagEntity, Relations>

    assertType<TagWithAllRelations>({ postsTags: [] })
    assertType<TagWithAllRelations>({
      postsTags: [{
        id: 1,
        postId: 1,
        tagId: 1,
        post: {
          id: 1,
          title: 'Post 1',
        },
      }],
    })

    type TagRelationObject = TypeOfRelations<TagEntity, Relations, {
      postsTags: {
        post: true
      }
    }>

    assertType<TagRelationObject>({ postsTags: [] })
    assertType<TagRelationObject>({
      postsTags: [{
        id: 1,
        postId: 1,
        tagId: 1,
        post: {
          id: 1,
          title: 'Post 1',
        },
      }],
    })
    assertType<TagRelationObject>({
      postsTags: [
        // @ts-expect-error post property is missing
        {
          id: 1,
          postId: 1,
          tagId: 1,
        },
      ],
    })

    type TagWithOptionalRelations = EntityWithOptionalRelations<TagEntity, Relations>

    assertType<TagWithOptionalRelations>({
      id: 1,
      name: 'Tech',
    })
    assertType<TagWithOptionalRelations>({
      id: 1,
      name: 'Tech',
      postsTags: [{
        id: 1,
        postId: 1,
        tagId: 1,
        post: {
          id: 1,
          title: 'Post 1',
        },
      }],
    })
    assertType<TagWithOptionalRelations>({
      id: 1,
      name: 'Tech',
      // @ts-expect-error postsTags should be array of PostTagEntity
      postsTags: [{}],
    })
  })
})
