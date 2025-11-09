# Contributing to Prompt Fusion

Thank you for your interest in contributing to Prompt Fusion! This project is about exploration and discovery in prompt composition for AI agents.

## Ways to Contribute

### 1. Report Issues or Bugs
- Use GitHub Issues to report problems
- Provide clear reproduction steps
- Include the fusion pattern you were using
- Share the framework (LangChain, OpenAI SDK, etc.)

### 2. Suggest New Weight Patterns
Have you discovered an effective weight pattern for a specific scenario?
- Document the pattern (weights and use case)
- Explain why it works better than alternatives
- Share example results if possible

### 3. Improve Documentation
- Fix typos or clarify existing docs
- Add examples or use cases
- Translate documentation
- Improve code comments

### 4. Add Framework Integration Examples
We welcome examples for additional frameworks:
- Google Gemini
- Cohere
- Open source LLM frameworks
- Other agent frameworks

**Requirements:**
- Use official SDK documentation
- Include clear, working examples
- Follow the existing example structure
- Add README specific to that integration

### 5. Share Benchmarks or Case Studies
Real-world results are valuable:
- Performance comparisons
- A/B test results comparing patterns
- Production deployment experiences
- Theoretical insights

## Community Ethos

This project values:
- **Exploration** - Novel applications of semantic weighting
- **Evidence** - Data-driven insights about what works
- **Clarity** - Clear explanations over complex abstractions
- **Openness** - Sharing discoveries, even negative results

We're interested in:
- How different LLMs respond to semantic weighting
- Optimal weight distributions for different tasks
- Real-world use cases and patterns
- Theoretical insights into prompt composition

## Code Contribution Guidelines

### Before You Start

1. **Check existing issues** - Someone may already be working on it
2. **Open a discussion** - For major changes, discuss first
3. **Start small** - Small PRs are easier to review

### Code Style

- **Core engine** - Keep it dependency-free and framework-agnostic
- **Examples** - Use official SDK documentation patterns
- **Comments** - Explain the "why", not just the "what"
- **Tests** - Include tests for core functionality changes

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Write clear commit messages
   - Follow existing code style
   - Add tests if applicable
4. **Test thoroughly**
   - Ensure existing tests pass
   - Test your changes manually
5. **Submit PR**
   - Clear description of changes
   - Reference related issues
   - Explain the reasoning

### Commit Message Format

```
type: brief description

Detailed explanation if needed

Fixes #issue-number
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks

### Example Contributions

**Good:**
```markdown
## Add Claude extended thinking example

Adds example showing how to use Prompt Fusion with Claude's
extended thinking mode.

Based on official Anthropic documentation.

Includes:
- Working code example
- Explanation of thinking + fusion interaction
- Edge case handling
```

**Needs improvement:**
```markdown
## Update

Changed some stuff
```

## Project Structure

```
prompt-fusion-publication/
├── core/                    # Core fusion engine (framework-agnostic)
├── patterns/                # Reusable fusion patterns
├── examples/
│   ├── langchain/          # LangChain integration
│   ├── openai-sdk/         # OpenAI SDK integration
│   └── anthropic/          # Anthropic integration
├── docs/                   # Deep-dive documentation
└── website/                # Landing page
```

**Where to contribute:**

- **Core improvements** → `core/promptFusionEngine.js`
- **New patterns** → `patterns/`
- **Framework examples** → `examples/[framework-name]/`
- **Documentation** → `docs/` or `README.md`

## Questions or Ideas?

- **Issues** - For bugs and feature requests
- **Discussions** - For questions and ideas
- **Email** - For private inquiries

## Code of Conduct

Be respectful and constructive:
- Welcome newcomers
- Assume good intentions
- Provide constructive feedback
- Focus on ideas, not individuals

## Recognition

Contributors will be recognized in:
- README acknowledgments
- Release notes
- Project documentation

Significant contributions may lead to collaborator status.

---

**Let's explore what's possible with semantic weighted prompt composition together.**
