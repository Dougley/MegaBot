**Thank you for taking the time to contribute to the development of MegaBot!**

Please follow these rules when making contributions to this repository.

# Source code

## Unwanted contributions

1. Style violations fixes
2. ESLint rules changes
3. Breaking changes to already existing commands, unless strictly necessary 
4. Unnecessarily large restructurings of code

## Code rules

### Verified as working

All code contributed to this repository should be verified as working, meaning you've tested the functionality at least once and didn't encounter unexpected behaviour.   
Please keep in mind that we might ask you to confirm if this is the case.

### ESLint

ESLint handles our style enforcement, when making contributions, **please confirm your code adheres to the style**, otherwise we're less inclined to merge it.   
To verify your code adheres to our styleguide, run `npm test` in the project root.

## Code practices

### Database operations

Although we expose the database driver as `_driver`, please don't use it. We strongly urge you to write abstractions instead.

### Global objects

Avoid polluting the global namespace unnecessarily, if something is not likely to be frequently used across the project, don't add it.   

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
})
```
