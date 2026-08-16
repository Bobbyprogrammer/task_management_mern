export default function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}
