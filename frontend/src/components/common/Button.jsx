export default function Button({ as: Component = 'button', variant = 'primary', type = 'button', className = '', ...props }) {
  return (
    <Component
      {...(Component === 'button' ? { type } : {})}
      {...props}
      className={`ui-button ui-button--${variant} ${className}`}
    />
  )
}
