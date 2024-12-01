// module.exports = func = (req, res, next) =>{
//     Promise.resolve(func(req, res, next))
//     .catch(next)
// }
module.exports = catchAsyncErrors = (fn) => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  };