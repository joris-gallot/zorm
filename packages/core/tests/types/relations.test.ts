/* eslint-disable ts/consistent-type-definitions */
import type { ZodNumber, ZodObject, ZodString } from 'zod'
import type { DeepEntityRelationsOption, EntityWithOptionalRelations, TypeOfRelations, WithRelationsOption } from '../../src/orm'
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

    type AllRelationsEnabled = DeepEntityRelationsOption<UserEntity, Relations>

    assertType<AllRelationsEnabled>({
      posts: true,
    })
    assertType<AllRelationsEnabled>({
      // @ts-expect-error should be true
      posts: false,
    })
    assertType<AllRelationsEnabled>({
      // @ts-expect-error should be true
      posts: undefined,
    })
    assertType<AllRelationsEnabled>({
      // @ts-expect-error should be true
      posts: 'true',
    })
    assertType<AllRelationsEnabled>({
      // @ts-expect-error should be true
      posts: 1,
    })
    assertType<AllRelationsEnabled>({
      // @ts-expect-error should be true
      posts: {
        user: true,
      },
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

    type UserWithRelations = TypeOfRelations<UserEntity, Relations, AllRelationsEnabled>

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

    type AllRelationsEnabled = DeepEntityRelationsOption<UserEntity, Relations>

    assertType<AllRelationsEnabled>({
      posts: {
        comments: true,
      },
    })
    assertType<AllRelationsEnabled>({
      posts: {
        comments: true,
        // @ts-expect-error foo is not a relation
        foo: true,
      },
    })
    assertType<AllRelationsEnabled>({
      // @ts-expect-error should an object with comments
      posts: true,
    })
    assertType<AllRelationsEnabled>({
      // @ts-expect-error should be true
      posts: false,
    })
    assertType<AllRelationsEnabled>({
      // @ts-expect-error should be true
      posts: undefined,
    })
    assertType<AllRelationsEnabled>({
      // @ts-expect-error should be true
      posts: 'true',
    })
    assertType<AllRelationsEnabled>({
      // @ts-expect-error should be true
      posts: 1,
    })
    assertType<AllRelationsEnabled>({
      posts: {
        // @ts-expect-error foo is not a relation
        foo: false,
      },
    })

    type _Invalid = TypeOfRelations<UserEntity, Relations, {
      // @ts-expect-error invalid is not a relation
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

    type UserWithRelations = TypeOfRelations<UserEntity, Relations, AllRelationsEnabled>

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

    type AllUserRelationsEnabled = DeepEntityRelationsOption<UserEntity, Relations>

    assertType<AllUserRelationsEnabled>({
      posts: {
        comments: true,
      },
    })
    assertType<AllUserRelationsEnabled>({
      posts: {
        comments: true,
        // @ts-expect-error foo is not a relation
        foo: true,
      },
    })
    assertType<AllUserRelationsEnabled>({
      // @ts-expect-error should an object with comments
      posts: true,
    })
    assertType<AllUserRelationsEnabled>({
      // @ts-expect-error should be true
      posts: false,
    })
    assertType<AllUserRelationsEnabled>({
      // @ts-expect-error should be true
      posts: undefined,
    })
    assertType<AllUserRelationsEnabled>({
      // @ts-expect-error should be true
      posts: 'true',
    })
    assertType<AllUserRelationsEnabled>({
      // @ts-expect-error should be true
      posts: 1,
    })
    assertType<AllUserRelationsEnabled>({
      posts: {
        // @ts-expect-error foo is not a relation
        foo: false,
      },
    })

    type _Invalid = TypeOfRelations<UserEntity, Relations, {
      // @ts-expect-error invalid is not a relation
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

    type UserWithRelations = TypeOfRelations<UserEntity, Relations, AllUserRelationsEnabled>

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

    type AllPostRelationsEnabled = DeepEntityRelationsOption<PostEntity, Relations>

    assertType<AllPostRelationsEnabled>({
      user: {
        posts: {
          comments: true,
        },
      },
      comments: true,
    })
    assertType<AllPostRelationsEnabled>({
      user: {
        // @ts-expect-error foo is not a relation
        foo: true,
      },
      // @ts-expect-error should be a boolean
      comments: {},
    })
    assertType<AllPostRelationsEnabled>({
      // @ts-expect-error should an object with comments
      user: true,
    })
    assertType<AllPostRelationsEnabled>({
      // @ts-expect-error should be true
      user: false,
    })
    assertType<AllPostRelationsEnabled>({
      // @ts-expect-error should be true
      user: undefined,
    })
    assertType<AllPostRelationsEnabled>({
      // @ts-expect-error should be true
      user: 'true',
    })
    assertType<AllPostRelationsEnabled>({
      // @ts-expect-error should be true
      user: 1,
    })
    assertType<AllPostRelationsEnabled>({
      user: {
        // @ts-expect-error foo is not a relation
        posts: false,
      },
    })
  })
})
