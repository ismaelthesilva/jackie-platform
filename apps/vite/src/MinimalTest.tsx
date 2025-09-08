const MinimalTest = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Minimal Test - No Context</h1>
      <p>This is a simple component without any context providers</p>
      <button onClick={() => alert('Button works!')}>Test Button</button>
    </div>
  );
};

export default MinimalTest;
