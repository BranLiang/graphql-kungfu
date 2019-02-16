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
    createUser: (_, args, __) => {
      console.log(args)
      return dummy
    }
  }
}