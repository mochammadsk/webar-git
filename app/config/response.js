module.exports = {
  commonError: {
    error: true,
    msg: "An error occurred on the server",
  },

  commonErrorMsg: (msg) => {
    return {
      error: true,
      msg: msg,
    };
  },

  commonSuccess: {
    error: false,
    msg: "Successfully loaded request",
  },

  commonSuccessMsg: (msg) => {
    return {
      error: false,
      msg: msg,
    };
  },

  commonResult: (data) => {
    return {
      error: false,
      msg: "Successfully loaded data",
      data: data,
    };
  },
};
