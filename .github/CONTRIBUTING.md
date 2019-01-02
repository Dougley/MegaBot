**Thank you for taking the time to contribute to the development of MegaBot!**

Please follow these rules when making contributions to this repository.

# Preface
This project is not affiliated with Discord, therefor any contributions are made with the understanding that it is freely given without any promise whatsoever of reward from the company.

# Unwanted contributions

1. Changes to ESLint configuration without justifiable reason
2. New commands that are confusing to use for end users, exceptions can be made for mod-only commands on a case by case basis
3. Breaking changes to already existing commands, unless strictly necessary 
4. Unnecessarily large restructurings of code
5. Additions of extra emoji's as reactions without justifiable reason
6. Retooling of rewards for the EXP system

# Code rules

### Verified as working

All code contributed to this repository should be verified as working, meaning you've tested the functionality at least once and didn't encounter unexpected behaviour.   
Please keep in mind that we might ask you to confirm if this is the case.

### ESLint

ESLint handles our style enforcement, when making contributions, **please confirm your code adheres to the style**, otherwise we're less inclined to merge it.   
To verify your code adheres to our styleguide, run `npm test` in the project root.

# Code practices

### Database operations

Although we expose the database driver as `_driver`, please don't use it. We strongly urge you to write abstractions instead.    
Importing methods from `_driver` using ES6 destructuring syntax is also not allowed.    

### Global objects

Avoid polluting the global namespace unnecessarily, if something is not likely to be frequently used across the project, don't add it.   

### Reactions
Reactions should be added by an intermediary method, preferably in `megabot-internals/inquirer.js`

### Queuing abstractions
**Never** write queue methods inside the function you're using, please make abstractions in `megabot-internals/admin-queue.js` or `megabot-internals/inquirer.js`

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

Prefer returning embeds if the data you're using is suited for it, single strings can be returned plain.    
Try to use embeds to usefully enrich your returned data, see `commands/upvote.js` for an example.    

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
