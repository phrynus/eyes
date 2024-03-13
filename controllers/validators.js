module.exports = async (validators) => {
  // 定义内部异步函数用于验证参数
  async function validate(obj, validator) {
    const [value, validationRegex] = validator;

    // 如果值是字符串，则应用正则表达式验证
    if (typeof value === "string") {
      if (!validationRegex.test(value)) {
        throw new Error(`Invalid parameter: ${value}`);
      }
    }
    // 如果值是数组，则递归验证数组中的每个元素
    else if (Array.isArray(value)) {
      for (const item of value) {
        await validate(item, validator);
      }
    }
    // 如果值是对象，则递归验证对象的每个属性值
    else if (typeof value === "object" && value !== null) {
      for (const key of Object.keys(value)) {
        await validate(value[key], validator);
      }
    }
    // 如果值的类型不受支持，则抛出错误
    else {
      throw new Error("Unsupported parameter type");
    }
  }

  const validationTasks = [];

  // 对输入的验证器数组进行遍历
  for (const validator of validators) {
    // 启动验证任务，并将任务加入到验证任务数组中
    validationTasks.push(validate(validator[0], validator));
  }

  try {
    // 使用Promise.all()等待所有验证任务完成
    await Promise.all(validationTasks);
    return true; // 所有验证都通过，返回true
  } catch (error) {
    return false; // 验证失败，返回false
  }
};
