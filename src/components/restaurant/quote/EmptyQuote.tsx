export const EmptyQuote = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
      <p>Your quote is empty</p>
      <p className="text-sm">Add items from the menu to get started</p>
    </div>
  );
};