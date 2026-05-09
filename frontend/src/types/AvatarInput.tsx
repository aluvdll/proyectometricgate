export type AvatarInputProps = {
  value: File |null;
  onChange: (avatar: File, avatarUrl?: string) => void;
  avatarUrl?: string | null;
    userId?: string; // opcional para edición
};