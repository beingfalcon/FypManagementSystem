function generateCode() {
    return (Math.floor(100000 + Math.random() * 900000)).toString();
  }
test('Comments Api Test', () => {
    expect(generateCode().length).toBe(6)
})