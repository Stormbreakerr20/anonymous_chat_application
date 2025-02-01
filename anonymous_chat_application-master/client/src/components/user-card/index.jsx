// ...existing imports...

const UserCard = ({ user }) => {
  return (
    <div className="user-card">
      <div className="user-info">
        <h3 className="user-name">{user.firstName}</h3>
        <p className="user-id">{user.email.split('@')[0]}</p> // Show only the ID part
      </div>
    </div>
  );
};
