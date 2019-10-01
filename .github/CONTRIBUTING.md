**Thank you for taking the time to contribute to the development of MegaBot!**

Please follow these rules when making contributions to this repository.

# Preface
While (parts of) this project might be used officially by Discord, the project is not affiliated or otherwise associated with Discord. Any contributions to this project are with the understanding that Discord has no obligation to reward or otherwise compensate you for any contributions made to this repository.

However, as a contributor, you're expected to uphold the [Code of Conduct](https://github.com/Dougley/MegaBot/blob/master/.github/CODE_OF_CONDUCT.md) from this project, and the [Discord Community Guidelines](https://discordapp.com/guidelines).

# Unwanted contributions

1. Changes to ESLint configuration without justifiable reason
2. New commands that are confusing to use for end-users; exceptions can be made for mod-only commands on a case by case basis
3. Breaking changes to already existing commands, unless strictly necessary 
4. Unnecessarily large restructurings of code
5. Additions of extra emojis as reactions without justifiable reason
6. Changes to rewards related to the EXP system

# Code rules

### Verified as working

If you're making a pull request, your code is supposed to have been tested to the best of your ability. We understand that running the project is a trivial task to people without access to a Zendesk deployment, however, we still expect your code to be tested to a certain degree.    
Do not expect project managers to test your code for you.

### ESLint

If you're making a pull request, your code is required to adhere to our styleguide, [StandardJS](https://standardjs.com/).  
Before submitting your pull request please make sure your code is correctly formatted.    
To verify your code adheres to our styleguide, run `npm test` in the project root.    
**Pull requests with style exceptions will not be merged.**

# Code practices

### Database operations

Although we expose the database driver as `_driver`, please don't use it. We strongly urge you to write abstractions instead.    
Importing methods from `_driver` using ES6 destructuring syntax is also not allowed.    
The exception to this rule is the Redis driver.

### Global objects

Generally, the global namespace is not supposed to be extended or otherwise mutated to prevent pollution.    
However, exceptions are made for modules that are commonly used across the project.     
Whether or not the module is commonly used is highly subjective and might vary each instance.

### Reactions
Reactions should be added by an intermediary method, preferably in `megabot-internals/inquirer.js`

### Queuing abstractions
**Never** write queue methods inside the function you're using. Please make abstractions in `megabot-internals/admin-queue.js` or `megabot-internals/inquirer.js`

```js
// ✗ bad
someCommand().then(res => {
  msg.addReaction(somereaction)
  db.create('questions', res)
})
```

```js
// ✓ good
const adminqueue = require('./megabot-internals/admin-queue')
someCommand().then(res => {
  adminqueue.createSomeAction(res)
})
```

### Line length

There are no set limits for the length of a line.  
However, chained functions should be split up when it's over 3 functions, or when the line is particularly long.

```js
// ✗ bad
const someString = 'Hello world!'
return someString.split(' ').map(x => x.toLowerCase()).filter(x => x !== '!').join(' ')
```

```js
// ✓ good
const someString = 'Hello world!'
return someString.split(' ') // the first function can be on the same line
  .map(x => x.toLowerCase())
  .filter(x => x !== '!')
  .join(' ')
```

### Embeds vs text

When working with Zendesk data, try to return embeds whenever possible, and display as much valuable data in those embeds as possible (eg. number of votes, the category of the suggestion, etc)

### Promises and async

**Always** chain promises where possible.   

```js
// ✗ bad
aPromise().then(result => {
 anotherPromise(result).then(anotherresult => {
   console.log(anotherresult)
 }).catch(console.error)
}).catch(console.error)
```

```js
// ✓ good
aPromise().then(result => {
 return anotherPromise(result)
}).then(anotherresult => {
 console.log(anotherresult)
}).catch(console.error)
```

```js
// ✓ even better
aPromise().then(async result => {
  const anotherresult = await anotherPromise(result)
  console.log(anotherresult)
}).catch(console.error)
```

```js
// 💯 great!
(async () => { // top-level async is used as an example, its not required
  try {
    const result = await aPromise()
    const anotherresult = await anotherPromise(result)
    console.log(anotherresult)
  } catch (e) { 
    console.error(e) 
  }
})()
```
