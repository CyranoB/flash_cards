# Security Policy

This document outlines the security policy for the AI-Powered Flashcard Generator (SmartDeck) project. We take security seriously and appreciate the community's efforts to responsibly disclose any vulnerabilities.

## Scope

This security policy applies to:
- The main SmartDeck application codebase
- All public repositories associated with the SmartDeck project
- API endpoints and services provided by SmartDeck

The policy does not cover:
- Third-party services integrated with SmartDeck (e.g., OpenAI API)
- User-generated content uploaded to SmartDeck instances
- Forked repositories not maintained by the core team

## Reporting a Vulnerability

### Preferred Method
Please use GitHub's built-in security advisory feature by clicking the "Report a vulnerability" button under the Security tab of the repository.

### Alternative Contact Method
If you cannot use GitHub's vulnerability reporting workflow, please send an email to security@smartdeck.example.com with the following information:
- A detailed description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested mitigations (if available)

Please encrypt sensitive information using our [PGP key](https://keys.openpgp.org/search?q=security@smartdeck.example.com).

## Response Process and Timeline

We are committed to responding promptly to security reports:

1. **Initial Response**: You will receive an acknowledgment within 48 hours of your report.
2. **Investigation**: We will investigate the issue and determine its validity and severity within 7 days.
3. **Updates**: You will receive regular updates on our progress (at least once a week).
4. **Resolution**: Once resolved, we will notify you and discuss the timeline for public disclosure.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

Security updates are generally provided only for the latest minor version of each major release.

## Disclosure Policy

We follow a coordinated disclosure process:

1. The reporter submits a vulnerability report.
2. Our team validates and addresses the issue.
3. We develop and test a fix.
4. We release the fix and notify users to update.
5. After users have had reasonable time to update (typically 14 days), we publicly disclose the vulnerability.

## Security Measures

SmartDeck implements several security measures:

### Rate Limiting
- Configurable rate limiting per IP address
- Default: 10 requests per minute with a 60-second interval
- Maximum of 500 concurrent IPs tracked

### Request Validation
- Content size limits (100KB maximum)
- Input validation for all parameters
- Type checking for API operations

### Error Handling and Logging
- Comprehensive error handling with detailed logging
- Structured logging of all API requests including:
  - Timestamp
  - Request type
  - Anonymized IP addresses
  - Status codes
  - Error details (when applicable)

## Security Best Practices for Deployment

When deploying SmartDeck, we recommend:

1. **Environment Variables**: Store sensitive information (API keys, credentials) in environment variables, never in code.
2. **HTTPS**: Always use HTTPS in production environments.
3. **Regular Updates**: Keep all dependencies updated to their latest secure versions.
4. **Access Control**: Implement proper access controls for administrative functions.
5. **Monitoring**: Set up monitoring and alerting for unusual activity.

## Security Acknowledgments

We appreciate the efforts of security researchers who help keep SmartDeck secure. Contributors who report valid security issues will be acknowledged (with permission) in our security advisories.

## License

This security policy is provided under the same [MIT License](LICENSE) as the SmartDeck project.
