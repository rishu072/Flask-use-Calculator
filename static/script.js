/**
 * Calculator Application
 * A secure, accessible calculator with keyboard support
 * Author: Rishu
 */

(function() {
  'use strict';

  // Calculator state
  const Calculator = {
    expression: '',
    lastResult: '',
    
    // DOM elements
    input: null,
    buttons: null,

    /**
     * Initialize the calculator
     */
    init() {
      this.input = document.getElementById('inputBox');
      this.buttons = document.querySelectorAll('button');
      
      if (!this.input) {
        console.error('Calculator input not found');
        return;
      }

      this.bindEvents();
    },

    /**
     * Bind all event listeners
     */
    bindEvents() {
      // Button click events
      this.buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          const value = e.target.dataset.value || e.target.textContent;
          this.handleInput(value);
        });
      });

      // Keyboard support
      document.addEventListener('keydown', (e) => {
        this.handleKeyboard(e);
      });
    },

    /**
     * Handle keyboard input
     */
    handleKeyboard(e) {
      const key = e.key;
      
      // Prevent default for calculator keys
      if (this.isCalculatorKey(key)) {
        e.preventDefault();
      }

      // Map keyboard keys to calculator actions
      const keyMap = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '+': '+', '-': '-', '*': '*', '/': '/',
        '.': '.', '%': '%',
        'Enter': '=', '=': '=',
        'Escape': 'AC', 'c': 'AC', 'C': 'AC',
        'Backspace': 'DEL', 'Delete': 'DEL'
      };

      if (keyMap[key]) {
        this.handleInput(keyMap[key]);
        this.highlightButton(keyMap[key]);
      }
    },

    /**
     * Check if key is a calculator key
     */
    isCalculatorKey(key) {
      return /^[0-9+\-*/.%=]$/.test(key) || 
             ['Enter', 'Escape', 'Backspace', 'Delete', 'c', 'C'].includes(key);
    },

    /**
     * Highlight button when pressed via keyboard
     */
    highlightButton(value) {
      const button = document.querySelector(`button[data-value="${value}"]`);
      if (button) {
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 150);
      }
    },

    /**
     * Handle calculator input
     */
    handleInput(value) {
      switch (value) {
        case '=':
          this.calculate();
          break;
        case 'AC':
          this.clear();
          break;
        case 'DEL':
          this.deleteLast();
          break;
        default:
          this.appendValue(value);
      }
    },

    /**
     * Append value to expression
     */
    appendValue(value) {
      // Validate input
      if (!this.isValidInput(value)) {
        return;
      }

      // Prevent multiple decimal points in the same number
      if (value === '.' && this.hasDecimalInCurrentNumber()) {
        return;
      }

      // Prevent multiple operators in a row
      if (this.isOperator(value) && this.lastCharIsOperator()) {
        this.expression = this.expression.slice(0, -1);
      }

      // Prevent starting with an operator (except minus for negative numbers)
      if (this.expression === '' && this.isOperator(value) && value !== '-') {
        return;
      }

      this.expression += value;
      this.updateDisplay();
    },

    /**
     * Check if value is a valid input
     */
    isValidInput(value) {
      return /^[0-9+\-*/.%]$/.test(value);
    },

    /**
     * Check if value is an operator
     */
    isOperator(value) {
      return ['+', '-', '*', '/', '%'].includes(value);
    },

    /**
     * Check if last character is an operator
     */
    lastCharIsOperator() {
      const lastChar = this.expression.slice(-1);
      return this.isOperator(lastChar);
    },

    /**
     * Check if current number already has a decimal point
     */
    hasDecimalInCurrentNumber() {
      const parts = this.expression.split(/[+\-*/%]/);
      const currentNumber = parts[parts.length - 1];
      return currentNumber.includes('.');
    },

    /**
     * Calculate the result safely (NO eval!)
     */
    calculate() {
      if (this.expression === '') {
        return;
      }

      // Remove trailing operator if exists
      let expr = this.expression;
      if (this.lastCharIsOperator()) {
        expr = expr.slice(0, -1);
      }

      if (expr === '') {
        return;
      }

      try {
        const result = this.safeEvaluate(expr);
        
        if (result === null || result === undefined || !isFinite(result)) {
          this.showError('Error');
          return;
        }

        // Format result (limit decimal places)
        const formattedResult = this.formatResult(result);
        this.expression = formattedResult;
        this.lastResult = formattedResult;
        this.updateDisplay();
      } catch (error) {
        this.showError('Error');
      }
    },

    /**
     * Safe mathematical expression evaluator (replaces eval)
     */
    safeEvaluate(expr) {
      // Replace percentage with /100
      expr = this.handlePercentage(expr);
      
      // Tokenize the expression
      const tokens = this.tokenize(expr);
      
      if (tokens.length === 0) {
        return null;
      }

      // Parse and evaluate using shunting-yard algorithm simplified
      return this.evaluateTokens(tokens);
    },

    /**
     * Handle percentage calculations
     */
    handlePercentage(expr) {
      // Replace X% with (X/100)
      return expr.replace(/(\d+\.?\d*)%/g, '($1/100)');
    },

    /**
     * Tokenize expression into numbers and operators
     */
    tokenize(expr) {
      const tokens = [];
      let currentNumber = '';
      let expectNegative = true; // Can we have a negative number here?

      for (let i = 0; i < expr.length; i++) {
        const char = expr[i];

        if (char === '(' || char === ')') {
          if (currentNumber) {
            tokens.push({ type: 'number', value: parseFloat(currentNumber) });
            currentNumber = '';
          }
          tokens.push({ type: 'paren', value: char });
          expectNegative = char === '(';
        } else if (/\d|\./.test(char)) {
          currentNumber += char;
          expectNegative = false;
        } else if (['+', '-', '*', '/'].includes(char)) {
          if (char === '-' && expectNegative) {
            currentNumber += char;
          } else {
            if (currentNumber) {
              tokens.push({ type: 'number', value: parseFloat(currentNumber) });
              currentNumber = '';
            }
            tokens.push({ type: 'operator', value: char });
            expectNegative = true;
          }
        }
      }

      if (currentNumber) {
        tokens.push({ type: 'number', value: parseFloat(currentNumber) });
      }

      return tokens;
    },

    /**
     * Evaluate tokenized expression
     */
    evaluateTokens(tokens) {
      // Handle parentheses first
      tokens = this.resolveParentheses(tokens);
      
      // First pass: handle * and /
      tokens = this.evaluateOperators(tokens, ['*', '/']);
      
      // Second pass: handle + and -
      tokens = this.evaluateOperators(tokens, ['+', '-']);

      if (tokens.length === 1 && tokens[0].type === 'number') {
        return tokens[0].value;
      }

      return null;
    },

    /**
     * Resolve parentheses in tokens
     */
    resolveParentheses(tokens) {
      let result = [...tokens];
      let hasParens = true;
      
      while (hasParens) {
        hasParens = false;
        let openIndex = -1;
        
        for (let i = 0; i < result.length; i++) {
          if (result[i].type === 'paren' && result[i].value === '(') {
            openIndex = i;
          } else if (result[i].type === 'paren' && result[i].value === ')' && openIndex !== -1) {
            hasParens = true;
            const innerTokens = result.slice(openIndex + 1, i);
            const innerResult = this.evaluateTokens(innerTokens);
            result.splice(openIndex, i - openIndex + 1, { type: 'number', value: innerResult });
            break;
          }
        }
      }
      
      return result;
    },

    /**
     * Evaluate specific operators
     */
    evaluateOperators(tokens, operators) {
      let result = [...tokens];
      let i = 0;

      while (i < result.length) {
        if (result[i].type === 'operator' && operators.includes(result[i].value)) {
          const left = result[i - 1].value;
          const right = result[i + 1].value;
          const op = result[i].value;
          
          let value;
          switch (op) {
            case '+': value = left + right; break;
            case '-': value = left - right; break;
            case '*': value = left * right; break;
            case '/': 
              if (right === 0) throw new Error('Division by zero');
              value = left / right; 
              break;
          }

          result.splice(i - 1, 3, { type: 'number', value });
          i = 0; // Restart from beginning
        } else {
          i++;
        }
      }

      return result;
    },

    /**
     * Format the result to a reasonable number of decimal places
     */
    formatResult(result) {
      // Handle very small or very large numbers
      if (Math.abs(result) < 0.0000001 && result !== 0) {
        return result.toExponential(6);
      }
      
      if (Math.abs(result) > 999999999999) {
        return result.toExponential(6);
      }

      // Round to 10 decimal places to avoid floating point issues
      const rounded = Math.round(result * 10000000000) / 10000000000;
      
      // Convert to string and remove unnecessary trailing zeros
      return String(rounded);
    },

    /**
     * Clear the calculator
     */
    clear() {
      this.expression = '';
      this.updateDisplay();
    },

    /**
     * Delete the last character
     */
    deleteLast() {
      this.expression = this.expression.slice(0, -1);
      this.updateDisplay();
    },

    /**
     * Show error message
     */
    showError(message) {
      this.input.value = message;
      this.expression = '';
      
      // Add shake animation
      this.input.classList.add('error');
      setTimeout(() => this.input.classList.remove('error'), 500);
    },

    /**
     * Update the display
     */
    updateDisplay() {
      // Format display with proper symbols
      let displayValue = this.expression
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−');
      
      this.input.value = displayValue || '';
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Calculator.init());
  } else {
    Calculator.init();
  }
})();
