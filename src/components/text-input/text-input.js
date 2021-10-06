export const TextInput = (props) => {
  const { onChange$, value } = props;
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange$(e)}
      {...props}
    ></input>
  );
};
