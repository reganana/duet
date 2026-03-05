from django import forms

class LoginForm(forms.Form):
    username = forms.CharField(required=False, label= "Username", max_length=100)
    password = forms.CharField(required=False, widget=forms.PasswordInput())