interface File {
  filename: string,
  mimetype: string,
  encoding: string,
  stream: any
}

type CreateUserInput = {
  input: {
    name: string,
    avatarFile: File
  }
}

const dummy = {
  id: 1,
  name: 'Bran',
  avatar: 'https://avatars1.githubusercontent.com/u/6628202?s=460&v=4'
}

export default {
  Query: {
    dummyUser: (_, {}) => dummy
  },
  Mutation: {
    createUser: (_, { input }: CreateUserInput, __) => {
      return dummy
    }
  }
}